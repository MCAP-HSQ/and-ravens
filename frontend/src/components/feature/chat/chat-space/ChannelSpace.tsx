import { Box } from '@radix-ui/themes'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChannelHeader } from '../../chat-header/ChannelHeader'
import { useParams } from 'react-router-dom'
import TabbableModule, { TabbableModuleTab, TabbableModuleTabConfig } from '@/components/layout/TabbableModule/TabbableModule'
import { getChannelTabRegistry } from '@/modules/channelTabRegistry'
import clsx from 'clsx'
import { useCallback, useMemo } from 'react'
import { useFrappePostCall } from 'frappe-react-sdk'

interface ChannelSpaceProps {
    channelData: ChannelListItem
}

export const ChannelSpace = ({ channelData }: ChannelSpaceProps) => {
    const { threadID } = useParams()
    const tabs = useMemo(() => getChannelTabRegistry(channelData), [channelData])
    const { call: postMessage } = useFrappePostCall('raven.api.raven_message.send_message')

    const onAddTab = useCallback(async (_tab: TabbableModuleTab, config: TabbableModuleTabConfig) => {
        if (!config.postToChannel) return
        const safeLabel = config.label.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
        await postMessage({
            channel_id: channelData.name,
            text: `<p><strong>${safeLabel}</strong> was added as a channel tab.</p>`,
            send_silently: false,
        })
    }, [channelData.name, postMessage])

    return (
        <Box>
            <ChannelHeader channelData={channelData} />
            <TabbableModule
                tabs={tabs}
                defaultTab='posts'
                storageKey={`and-ravens:channel-tabs:${channelData.name}`}
                onAddTab={onAddTab}
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
