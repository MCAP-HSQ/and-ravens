# And Ravens feature map

Source specification: `MicrosoftTeams_FSD_v0.1_2026-07-15.xlsx`, supplied by Hardy Tayyib-Bah on 2026-07-15.

This document maps the external Teams feature inventory to the Raven fork. “Implemented” means the feature is connected to a real Raven or Frappe data source/action in this branch. It does not claim Microsoft API or visual parity.

## Implemented in the collaboration-hub slice

| Teams FSD capability | And Ravens implementation | Backing system |
| --- | --- | --- |
| App-bar navigation | Persistent Activity, Chat, Calendar, Calls, Files, AI, Apps and Settings rail | React Router + Raven workspace context |
| Activity | Unread message/thread totals and a deep-linked mention feed | Raven unread and mentions APIs |
| Chat / Posts | Existing Raven channels, DMs, threads, rich messages, mentions and reactions | Raven messaging DocTypes/APIs |
| Calendar | Month view of accessible Frappe Events, including meeting links | Frappe `Event` |
| Calls / Meet now | Start a Google Meet for a Raven channel; list and rejoin recent linked meetings | Existing Raven event API + Google Calendar integration |
| Files / Shared | Search and filter images and documents shared in accessible conversations | Raven message/file search API |
| Copilot-style AI | Discover enabled Raven bots and open/create a direct conversation | Raven AI + DM API |
| Apps catalogue | Discover and launch connected collaboration tools | And Ravens routes + Frappe Desk routes |
| Admin | Product settings entry from the app rail and catalogue | Existing Raven settings/role checks |

## Already present upstream

- Public, private and open channels; direct messages and self messages.
- Rich text, code blocks, emojis, files, images, GIFs, mentions, reactions, replies and threads.
- Message/file/channel/user search, pinned and saved messages, push notifications and responsive/mobile clients.
- Workspaces, channel membership/administration, document linking, webhooks, scheduled messages, document notifications and AI agents.

## Deferred provider/backend work

| FSD capability | Required next work |
| --- | --- |
| PSTN/audio/video calling and voicemail | Select a WebRTC/PSTN provider, add call-session/history models, permissions and realtime state. The current Calls screen intentionally exposes Raven’s existing Google Meet flow only. |
| OneDrive/SharePoint | Add Microsoft Entra OAuth, Graph scopes, drive-item browsing/upload, token storage and tenant policy handling. Current Files searches Raven-managed shares. |
| Exchange calendar sync | Add Microsoft Graph calendar adapter. Current Calendar uses Frappe Events and Google Meet links. |
| Configurable channel tabs (Page, Notes, Planner, Power BI, custom apps) | Add a `Raven Channel Tab` model, app manifest/permission model, tab configuration UI and safe embed policy. |
| Install/remove/upload app marketplace | Add an administrator-controlled app registry, manifest validation, install scopes and lifecycle hooks. The current Apps surface is a launcher for connected tools. |
| Teams Activity parity (reactions, joins, app changes, meetings) | Add a normalized activity-event log and per-user read state; Raven currently provides deep-linked mentions and unread counts. |
| Teams/Graph/Power Automate external interfaces | Implement only after tenant, licensing, consent and data-residency requirements are confirmed. |

## Compatibility decision

The repository and visible app title are **And Ravens**, while the Frappe app/module name remains `raven`. Renaming the module would break existing DocType names, patches, assets, bench commands and installed-site upgrade paths. This keeps the fork install-compatible with Raven while allowing the product surface to diverge.
