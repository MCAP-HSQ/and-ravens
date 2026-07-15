import { Box } from '@radix-ui/themes'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChatBoxBody } from '../ChatStream/ChatBoxBody'
import { ChannelHeader } from '../../chat-header/ChannelHeader'
import { useSearchParams } from 'react-router-dom'
import ChannelTabs from '@/components/layout/ChannelTabs/ChannelTabs'
import ViewFilesContent from '../../files/ViewFilesContent'

interface ChannelSpaceProps {
    channelData: ChannelListItem
}

export const ChannelSpace = ({ channelData }: ChannelSpaceProps) => {

    const [searchParams] = useSearchParams()
    const activeTab = searchParams.get('tab') === 'shared' ? 'shared' : 'posts'

    return (
        <Box>
            <ChannelHeader channelData={channelData} />
            <ChannelTabs />
            {activeTab === 'shared' ? (
                <Box className='h-screen overflow-y-auto px-4 pb-6 pt-28'>
                    <ViewFilesContent embedded />
                </Box>
            ) : (
                <ChatBoxBody channelData={channelData} headerHasTabs />
            )}
        </Box>
    )
}
