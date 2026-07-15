import { Box } from '@radix-ui/themes'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChannelHeader } from '../../chat-header/ChannelHeader'
import { useParams } from 'react-router-dom'
import TabbableModule from '@/components/layout/TabbableModule/TabbableModule'
import { getChannelTabRegistry } from '@/modules/channelTabRegistry'
import clsx from 'clsx'
import { useMemo } from 'react'

interface ChannelSpaceProps {
    channelData: ChannelListItem
}

export const ChannelSpace = ({ channelData }: ChannelSpaceProps) => {
    const { threadID } = useParams()
    const tabs = useMemo(() => getChannelTabRegistry(channelData), [channelData])

    return (
        <Box>
            <ChannelHeader channelData={channelData} />
            <TabbableModule
                tabs={tabs}
                defaultTab='posts'
                storageKey={`and-ravens:channel-tabs:${channelData.name}`}
                ariaLabel={`${channelData.channel_name} modules`}
                tabListClassName={clsx(
                    'fixed top-[53px] z-[998] h-11',
                    threadID
                        ? 'w-screen sm:w-[calc((100vw-var(--sidebar-width)-var(--space-8))/2)]'
                        : 'w-screen sm:w-[calc(100vw-var(--sidebar-width)-var(--space-6))]',
                )}
            />
        </Box>
    )
}
