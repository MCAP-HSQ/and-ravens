import { TabbableModuleTab } from '@/components/layout/TabbableModule/TabbableModule'
import { ChatBoxBody } from '@/components/feature/chat/ChatStream/ChatBoxBody'
import ViewFilesContent from '@/components/feature/files/ViewFilesContent'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Box } from '@radix-ui/themes'
import { Component as ActivityPage } from '@/pages/hub/ActivityPage'
import { Component as CalendarPage } from '@/pages/hub/CalendarPage'
import { Component as CallsPage } from '@/pages/hub/CallsPage'
import { Component as AIPage } from '@/pages/hub/AIPage'
import { Component as AppsPage } from '@/pages/hub/AppsPage'
import { LuActivity, LuBot, LuCalendarDays, LuLayoutGrid, LuPhone } from 'react-icons/lu'
import { ReactNode } from 'react'

const moduleFrame = (content: ReactNode) => (
    <Box className='h-screen overflow-hidden pt-24 [&>div]:h-[calc(100vh-6rem)]'>
        {content}
    </Box>
)

/**
 * Built-in channel modules. Add another feature by registering one object;
 * the tabbable host supplies the tab UI, routing state and panel lifecycle.
 */
export const getChannelTabRegistry = (channelData: ChannelListItem): TabbableModuleTab[] => [
    {
        id: 'posts',
        label: 'Posts',
        required: true,
        render: () => <ChatBoxBody channelData={channelData} headerHasTabs />,
        panelClassName: 'h-screen',
    },
    {
        id: 'shared',
        label: 'Shared',
        required: true,
        render: () => (
            <Box className='h-screen overflow-y-auto px-4 pb-6 pt-28'>
                <ViewFilesContent embedded />
            </Box>
        ),
        panelClassName: 'h-screen overflow-hidden',
    },
    {
        id: 'activity',
        label: 'Activity',
        description: 'Mentions, unread work and recent channel activity.',
        icon: <LuActivity size={16} />,
        render: () => moduleFrame(<ActivityPage />),
        panelClassName: 'h-screen overflow-hidden',
    },
    {
        id: 'calendar',
        label: 'Calendar',
        description: 'Events and meeting links from Frappe Calendar.',
        icon: <LuCalendarDays size={16} />,
        render: () => moduleFrame(<CalendarPage />),
        panelClassName: 'h-screen overflow-hidden',
    },
    {
        id: 'calls',
        label: 'Calls',
        description: 'Start and rejoin channel meetings.',
        icon: <LuPhone size={16} />,
        render: () => moduleFrame(<CallsPage />),
        panelClassName: 'h-screen overflow-hidden',
    },
    {
        id: 'ai',
        label: 'AI',
        description: 'Open an And Ravens AI agent inside this channel.',
        icon: <LuBot size={16} />,
        render: () => moduleFrame(<AIPage />),
        panelClassName: 'h-screen overflow-hidden',
    },
    {
        id: 'apps',
        label: 'Apps',
        description: 'Launch the collaboration tools connected to this workspace.',
        icon: <LuLayoutGrid size={16} />,
        render: () => moduleFrame(<AppsPage />),
        panelClassName: 'h-screen overflow-hidden',
    },
]
