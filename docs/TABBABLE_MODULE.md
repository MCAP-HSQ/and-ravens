# Tabbable module

`TabbableModule` is the reusable host for content that should appear as tabs. It owns:

- accessible tab roles and keyboard navigation;
- active-tab URL state using `?tab=<id>`;
- default, disabled and hidden tab behavior;
- lazy mounting of only the selected panel;
- horizontal overflow and optional trailing actions.

Features do not implement tab controls or switching logic. They register an object with a stable ID, a label and a render function.

```tsx
export const getChannelTabRegistry = (channel): TabbableModuleTab[] => [
    {
        id: 'posts',
        label: 'Posts',
        render: () => <ChatBoxBody channelData={channel} />,
    },
    {
        id: 'shared',
        label: 'Shared',
        render: () => <ViewFilesContent embedded />,
    },
    {
        id: 'planner',
        label: 'Planner',
        render: () => <ChannelPlanner channelID={channel.name} />,
    },
]
```

The channel integration lives in `frontend/src/modules/channelTabRegistry.tsx`. Adding the `planner` entry is sufficient to get selection, deep linking, keyboard behavior and panel lifecycle from the shared host.
