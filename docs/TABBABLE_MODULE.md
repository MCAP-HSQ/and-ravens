# Tabbable module

`TabbableModule` is the reusable host for content that should appear as tabs. It owns:

- accessible tab roles and keyboard navigation;
- active-tab URL state using `?tab=<id>`;
- default, disabled and hidden tab behavior;
- lazy mounting of only the selected panel;
- horizontal overflow and optional trailing actions;
- a Teams-style `+` **Add a tab dialog** that creates and activates a module tab;
- per-host persistence when a `storageKey` is provided;
- removal of optional tabs from the active-tab menu.

Features do not implement tab controls or switching logic. They register an object with a stable ID, a label and a render function.

```tsx
export const getChannelTabRegistry = (channel): TabbableModuleTab[] => [
    {
        id: 'posts',
        label: 'Posts',
        required: true,
        render: () => <ChatBoxBody channelData={channel} />,
    },
    {
        id: 'shared',
        label: 'Shared',
        required: true,
        render: () => <ViewFilesContent embedded />,
    },
    {
        id: 'planner',
        label: 'Planner',
        description: 'Tasks and plans for this channel.',
        icon: <LuClipboardList />,
        render: () => <ChannelPlanner channelID={channel.name} />,
    },
]
```

Required entries are always visible. Optional entries automatically appear in the `+` picker. Selecting `Planner` creates the tab, activates it and persists it using the channel host's storage key.

## Add-tab states

The host implements the complete interaction rather than delegating modal setup to each feature:

1. **Closed** — only the `+` trigger is present in the tab strip.
2. **Picker** — modal dialog with app search, catalogue cards, empty results and unavailable-app states.
3. **Details** — selected app overview with Back, Cancel and Add actions.
4. **Configure** — editable tab name and a default-on “Post to the channel about this tab” option.
5. **Saving** — modal controls are locked while the tab and optional channel post are created.
6. **Error** — configuration remains open with a retryable inline error.
7. **Complete** — dialog closes, the tab is persisted and the new module becomes active.
8. **Remove confirmation** — optional tabs require confirmation; Posts and Shared cannot be removed.

Behavior references:

- https://support.microsoft.com/en-US/teams/chat-channels/use-a-tab-in-a-channel-or-chat-in-microsoft-teams
- https://support.microsoft.com/en-US/project/use-the-project-or-roadmap-app-in-teams
- https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/what-are-tabs

The channel catalogue lives in `frontend/src/modules/channelTabRegistry.tsx`. Adding the `planner` entry is sufficient to get the picker card, details/configuration states, tab creation, optional channel post, selection, deep linking, keyboard behavior, persistence, removal and panel lifecycle from the shared host.
