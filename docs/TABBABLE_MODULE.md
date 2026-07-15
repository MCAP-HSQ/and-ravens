# Tabbable module

`TabbableModule` is the reusable host for content that should appear as tabs. It owns:

- accessible tab roles and keyboard navigation;
- active-tab URL state using `?tab=<id>`;
- default, disabled and hidden tab behavior;
- lazy mounting of only the selected panel;
- horizontal overflow and optional trailing actions;
- a Teams-style `+` picker that creates and activates a module tab;
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

The channel catalogue lives in `frontend/src/modules/channelTabRegistry.tsx`. Adding the `planner` entry is sufficient to get the picker entry, tab creation, selection, deep linking, keyboard behavior, persistence, removal and panel lifecycle from the shared host.
