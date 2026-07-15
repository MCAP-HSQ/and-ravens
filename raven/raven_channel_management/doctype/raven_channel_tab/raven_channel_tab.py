# Copyright (c) 2026, MCAP-HSQ and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class RavenChannelTab(Document):
	def validate(self):
		self.display_name = (self.display_name or "").strip()
		if not self.display_name:
			frappe.throw(_("A tab name is required."), frappe.ValidationError)
		if len(self.display_name) > 80:
			frappe.throw(_("Tab names cannot be longer than 80 characters."), frappe.ValidationError)

		channel = frappe.db.get_value(
			"Raven Channel",
			self.channel_id,
			["is_direct_message", "is_thread"],
			as_dict=True,
		)
		if not channel:
			frappe.throw(_("Channel not found."), frappe.DoesNotExistError)
		if channel.is_direct_message or channel.is_thread:
			frappe.throw(_("Tabs can only be added to workspace channels."), frappe.ValidationError)


def on_doctype_update():
	frappe.db.add_unique(
		"Raven Channel Tab",
		fields=["channel_id", "app_id"],
		constraint_name="unique_channel_tab_app",
	)
