import { ChannelList } from '../../feature/channels/ChannelList'
import { DirectMessageList } from '../../feature/direct-messages/DirectMessageList'
import { SidebarBadge, SidebarItem } from './SidebarComp'
import { AccessibleIcon, Box, Flex, ScrollArea, Text } from '@radix-ui/themes'
import { useFetchUnreadMessageCount } from '@/hooks/useUnreadMessageCount'
import PinnedChannels from './PinnedChannels'
import React, { useContext, useMemo } from 'react'
import { __ } from '@/utils/translations'
import { UnreadList } from '@/components/feature/channel-groups/UnreadList'
import { ChannelListContext, ChannelListContextType } from '@/utils/channel/ChannelListProvider'
import { useGetChannelUnreadCounts } from './useGetChannelUnreadCounts'
import { useParams } from 'react-router-dom'
import { atomWithStorage } from 'jotai/utils'
import useUnreadThreadsCount from '@/hooks/useUnreadThreadsCount'
import FrappeIcon from '@/components/icons/FrappeIcon'

export const showOnlyMyChannelsAtom = atomWithStorage('showOnlyMyChannels', false)

export const SidebarBody = () => {

    const unread_count = useFetchUnreadMessageCount()
    const { channels, dm_channels } = useContext(ChannelListContext) as ChannelListContextType

    const { workspaceID } = useParams()

    const workspaceChannels = useMemo(() => {
        return channels.filter((channel) => channel.workspace === workspaceID)
    }, [channels, workspaceID])

    const { unreadChannels, readChannels, unreadDMs, readDMs } = useGetChannelUnreadCounts({
        channels: workspaceChannels,
        dm_channels,
        unread_count: unread_count?.message
    })

    return (
        <ScrollArea type='hover' scrollbars='vertical' className='h-[calc(100vh-52px)]'>
            <Flex direction='column' gap='3' className='overflow-x-hidden px-2 py-2 pb-12 sm:pb-3'>
                <Flex direction='column' gap='0'>
                    <ThreadsButton />
                    <SidebarItemForPage
                        to={'saved-messages'}
                        label='Saved'
                        icon={<FrappeIcon name='bookmark' />}
                        iconLabel='Saved Message' />
                </Flex>
                <PinnedChannels unread_count={unread_count?.message} />
                {(unreadChannels.length > 0 || unreadDMs.length > 0) && <UnreadList unreadChannels={unreadChannels} unreadDMs={unreadDMs} />}
                <ChannelList channels={readChannels} />
                <DirectMessageList dm_channels={readDMs} />
            </Flex>
        </ScrollArea>
    )
}

const ThreadsButton = () => {

    const { threadID, workspaceID } = useParams()

    const { data: unreadThreads } = useUnreadThreadsCount()

    const totalUnreadThreads = useMemo(() => {
        // Need to remove the current thread ID from the unread threads if it exists. The current thread is not included in the unread threads since the user is already on the thread
        return unreadThreads?.message.filter((t) => t.name !== threadID && t.workspace === workspaceID).length || 0
    }, [unreadThreads, threadID, workspaceID])

    return (
        <SidebarItemForPage
            to={'threads'}
            label='Threads'
            unreadCount={totalUnreadThreads}
            icon={<FrappeIcon name='message-square-text' />}
            iconLabel='Threads' />
    )
}

interface SidebarItemForPageProps {
    to: string
    label: string
    icon: React.ReactNode
    iconLabel: string,
    unreadCount?: number
}

const SidebarItemForPage = ({ to, label, icon, iconLabel, unreadCount }: SidebarItemForPageProps) => {
    return (
        <Box>
            <SidebarItem to={to} className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <AccessibleIcon label={__(iconLabel)}>
                        {icon}
                    </AccessibleIcon>
                    <Box>
                        <Text size='2' weight='medium'>{__(label)}</Text>
                    </Box>
                </div>

                {unreadCount && unreadCount > 0 ? <SidebarBadge>{unreadCount}</SidebarBadge> : null}
            </SidebarItem>
        </Box>
    )
}
