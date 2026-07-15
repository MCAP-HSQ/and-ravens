import json

import frappe
from frappe import _
from frappe.utils import cint

from raven.utils import get_channel_member, get_raven_room, get_workspace_member


CHANNEL_APPS = {
	"activity": {
		"label": "Activity",
		"description": "Mentions, unread work and recent channel activity.",
		"icon": "activity",
		"tab_type": "Static",
	},
	"calendar": {
		"label": "Calendar",
		"description": "Events and meeting links from Frappe Calendar.",
		"icon": "calendar-days",
		"tab_type": "Static",
	},
	"calls": {
		"label": "Calls",
		"description": "Start and rejoin channel meetings.",
		"icon": "phone",
		"tab_type": "Static",
	},
	"ai": {
		"label": "AI",
		"description": "Open an And Ravens AI agent inside this channel.",
		"icon": "bot",
		"tab_type": "Static",
	},
	"apps": {
		"label": "Apps",
		"description": "Launch the collaboration tools connected to this workspace.",
		"icon": "layout-grid",
		"tab_type": "Static",
	},
}


def _get_channel(channel_id: str):
	channel = frappe.db.get_value(
		"Raven Channel",
		channel_id,
		["name", "workspace", "type", "is_direct_message", "is_thread", "is_archived"],
		as_dict=True,
	)
	if not channel:
		frappe.throw(_("Channel not found."), frappe.DoesNotExistError)
	if channel.is_direct_message or channel.is_thread:
		frappe.throw(_("Tabs are only available in workspace channels."), frappe.ValidationError)
	return channel


def _assert_can_view(channel_id: str):
	channel = _get_channel(channel_id)
	if frappe.session.user == "Administrator":
		return channel

	workspace_member = get_workspace_member(channel.workspace)
	channel_member = get_channel_member(channel_id)
	if not workspace_member or (channel.type == "Private" and not channel_member):
		frappe.throw(
			_("You don't have permission to view tabs in this channel."), frappe.PermissionError
		)
	return channel


def _can_manage(channel_id: str, channel=None) -> bool:
	channel = channel or _get_channel(channel_id)
	if frappe.session.user == "Administrator":
		return True
	channel_member = get_channel_member(channel_id)
	workspace_member = get_workspace_member(channel.workspace)
	return bool(
		(channel_member and channel_member.get("is_admin"))
		or (workspace_member and workspace_member.get("is_admin"))
	)


def _assert_can_manage(channel_id: str):
	channel = _assert_can_view(channel_id)
	if not _can_manage(channel_id, channel):
		frappe.throw(
			_("Only channel or workspace admins can manage channel tabs."), frappe.PermissionError
		)
	return channel


def _serialise_tab(tab) -> dict:
	configuration = tab.get("configuration")
	if isinstance(configuration, str):
		try:
			configuration = json.loads(configuration)
		except (TypeError, ValueError):
			configuration = {}
	return {
		"id": tab.get("name"),
		"app_id": tab.get("app_id"),
		"display_name": tab.get("display_name"),
		"tab_type": tab.get("tab_type"),
		"position": tab.get("position"),
		"configuration": configuration or {},
	}


def _publish_update(channel_id: str):
	frappe.publish_realtime(
		"raven:channel_tabs_updated",
		{"channel_id": channel_id},
		room=get_raven_room(),
		after_commit=True,
	)


@frappe.whitelist(methods=["GET"])
def get_channel_tabs(channel_id: str):
	channel = _assert_can_view(channel_id)
	tabs = frappe.get_all(
		"Raven Channel Tab",
		filters={"channel_id": channel_id},
		fields=["name", "app_id", "display_name", "tab_type", "position", "configuration"],
		order_by="position asc, creation asc",
	)
	installed = {tab.app_id for tab in tabs}
	available_apps = [
		{"app_id": app_id, **definition}
		for app_id, definition in CHANNEL_APPS.items()
		if app_id not in installed
	]
	return {
		"tabs": [_serialise_tab(tab) for tab in tabs],
		"available_apps": available_apps,
		"can_manage": _can_manage(channel_id, channel),
	}


@frappe.whitelist(methods=["GET"])
def get_channel_tab(tab_id: str):
	tab = frappe.db.get_value(
		"Raven Channel Tab",
		tab_id,
		["name", "channel_id", "app_id", "display_name", "tab_type", "position", "configuration"],
		as_dict=True,
	)
	if not tab:
		frappe.throw(_("Tab not found."), frappe.DoesNotExistError)
	_assert_can_view(tab.channel_id)
	return _serialise_tab(tab)


@frappe.whitelist(methods=["POST"])
def create_channel_tab(
	channel_id: str,
	app_id: str,
	display_name: str | None = None,
	configuration: dict | str | None = None,
	post_to_channel: bool | str = False,
	idempotency_key: str | None = None,
):
	_assert_can_manage(channel_id)
	app = CHANNEL_APPS.get(app_id)
	if not app:
		frappe.throw(_("This app is not available for channel tabs."), frappe.ValidationError)

	if idempotency_key:
		existing = frappe.db.get_value(
			"Raven Channel Tab",
			{"channel_id": channel_id, "idempotency_key": idempotency_key},
			["name", "app_id", "display_name", "tab_type", "position", "configuration"],
			as_dict=True,
		)
		if existing:
			return _serialise_tab(existing)

	if frappe.db.exists("Raven Channel Tab", {"channel_id": channel_id, "app_id": app_id}):
		frappe.throw(_("That app is already a tab in this channel."), frappe.DuplicateEntryError)

	if isinstance(configuration, str):
		try:
			configuration = json.loads(configuration)
		except ValueError:
			frappe.throw(_("The tab configuration is not valid JSON."), frappe.ValidationError)

	last_tab = frappe.get_all(
		"Raven Channel Tab",
		filters={"channel_id": channel_id},
		fields=["position"],
		order_by="position desc",
		limit=1,
	)
	position = cint(last_tab[0].position if last_tab else 0) + 1
	doc = frappe.get_doc(
		{
			"doctype": "Raven Channel Tab",
			"channel_id": channel_id,
			"app_id": app_id,
			"display_name": (display_name or app["label"]).strip(),
			"tab_type": app["tab_type"],
			"position": position,
			"configuration": configuration or {},
			"idempotency_key": idempotency_key,
		}
	).insert(ignore_permissions=True)

	if cint(post_to_channel):
		actor = frappe.get_cached_value("User", frappe.session.user, "full_name") or frappe.session.user
		frappe.get_doc(
			{
				"doctype": "Raven Message",
				"channel_id": channel_id,
				"message_type": "System",
				"text": _("{0} added {1} as a channel tab.").format(actor, doc.display_name),
			}
		).insert(ignore_permissions=True)

	_publish_update(channel_id)
	return _serialise_tab(doc)


@frappe.whitelist(methods=["POST"])
def rename_channel_tab(tab_id: str, display_name: str):
	doc = frappe.get_doc("Raven Channel Tab", tab_id)
	_assert_can_manage(doc.channel_id)
	doc.display_name = display_name
	doc.save(ignore_permissions=True)
	_publish_update(doc.channel_id)
	return _serialise_tab(doc)


@frappe.whitelist(methods=["POST"])
def remove_channel_tab(tab_id: str):
	doc = frappe.get_doc("Raven Channel Tab", tab_id)
	_assert_can_manage(doc.channel_id)
	channel_id = doc.channel_id
	doc.delete(ignore_permissions=True)
	_publish_update(channel_id)
	return {"removed": tab_id}
