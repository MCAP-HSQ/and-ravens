import { TabbableModuleTab } from '@/components/layout/TabbableModule/TabbableModule'
import { ChatBoxBody } from '@/components/feature/chat/ChatStream/ChatBoxBody'
import ViewFilesContent from '@/components/feature/files/ViewFilesContent'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Box } from '@radix-ui/themes'

/**
 * Built-in channel modules. Add another feature by registering one object;
 * the tabbable host supplies the tab UI, routing state and panel lifecycle.
 */
export const getChannelTabRegistry = (channelData: ChannelListItem): TabbableModuleTab[] => [
    {
        id: 'posts',
        label: 'Posts',
        render: () => <ChatBoxBody channelData={channelData} headerHasTabs />,
        panelClassName: 'h-screen',
    },
    {
        id: 'shared',
        label: 'Shared',
        render: () => (
            <Box className='h-screen overflow-y-auto px-4 pb-6 pt-28'>
                <ViewFilesContent embedded />
            </Box>
        ),
        panelClassName: 'h-screen overflow-hidden',
    },
]
