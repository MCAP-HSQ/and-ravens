import frappe
from frappe.tests import IntegrationTestCase

from raven.api.channel_tabs import (
	create_channel_tab,
	get_channel_tabs,
	remove_channel_tab,
	rename_channel_tab,
)

class TestChannelTabs(IntegrationTestCase):
	def setUp(self):
		frappe.set_user("Administrator")
		suffix = frappe.generate_hash(length=6)
		self.admin_user = f"tab-admin-{suffix}@example.com"
		self.member_user = f"tab-member-{suffix}@example.com"
		for email, first_name in (
			(self.admin_user, "Tab Admin"),
			(self.member_user, "Tab Member"),
		):
			frappe.get_doc(
				{
					"doctype": "User",
					"email": email,
					"first_name": first_name,
					"send_welcome_email": 0,
				}
			).insert(ignore_permissions=True)
			if not frappe.db.exists("Raven User", email):
				frappe.get_doc(
					{
						"doctype": "Raven User",
						"type": "User",
						"user": email,
						"full_name": first_name,
					}
				).insert(ignore_permissions=True)

		self.workspace = frappe.get_doc(
			{
				"doctype": "Raven Workspace",
				"workspace_name": f"Channel Tab Tests {frappe.generate_hash(length=6)}",
				"type": "Public",
			}
		).insert(ignore_permissions=True)
		self.channel = frappe.get_doc(
			{
				"doctype": "Raven Channel",
				"channel_name": "tab-tests",
				"type": "Open",
				"workspace": self.workspace.name,
			}
		).insert(ignore_permissions=True)

		for user, is_admin in ((self.admin_user, 1), (self.member_user, 0)):
			frappe.get_doc(
				{
					"doctype": "Raven Workspace Member",
					"workspace": self.workspace.name,
					"user": user,
					"is_admin": is_admin,
				}
			).insert(ignore_permissions=True)

	def tearDown(self):
		frappe.db.rollback()
		frappe.set_user("Administrator")
		frappe.clear_cache()

	def test_channel_tabs_are_shared_but_only_admins_manage_them(self):
		frappe.set_user(self.admin_user)
		created = create_channel_tab(
			self.channel.name,
			"activity",
			display_name="Team Activity",
			idempotency_key="channel-tab-test",
		)
		self.assertEqual(created["display_name"], "Team Activity")

		frappe.set_user(self.member_user)
		payload = get_channel_tabs(self.channel.name)
		self.assertEqual(payload["tabs"][0]["id"], created["id"])
		self.assertFalse(payload["can_manage"])
		with self.assertRaises(frappe.PermissionError):
			create_channel_tab(self.channel.name, "calendar")

		frappe.set_user(self.admin_user)
		renamed = rename_channel_tab(created["id"], "Workstream Activity")
		self.assertEqual(renamed["display_name"], "Workstream Activity")
		removed = remove_channel_tab(created["id"])
		self.assertEqual(removed["removed"], created["id"])
		self.assertEqual(get_channel_tabs(self.channel.name)["tabs"], [])

	def test_create_is_idempotent_and_rejects_duplicate_apps(self):
		frappe.set_user(self.admin_user)
		first = create_channel_tab(
			self.channel.name,
			"calendar",
			idempotency_key="same-request",
		)
		second = create_channel_tab(
			self.channel.name,
			"calendar",
			idempotency_key="same-request",
		)
		self.assertEqual(first["id"], second["id"])
		with self.assertRaises(frappe.DuplicateEntryError):
			create_channel_tab(self.channel.name, "calendar")
