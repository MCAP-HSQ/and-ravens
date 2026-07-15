import { Box, Flex, Grid, Text } from '@radix-ui/themes'
import { useFrappePostCall } from 'frappe-react-sdk'
import parse from 'html-react-parser'
import { Link, useParams } from 'react-router-dom'
import { LuActivity, LuAtSign, LuMessageSquareText } from 'react-icons/lu'
import HubPage from '@/components/layout/HubPage'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { Loader } from '@/components/common/Loader'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import useUnreadMessageCount from '@/hooks/useUnreadMessageCount'
import useUnreadThreadsCount from '@/hooks/useUnreadThreadsCount'
import { getTimePassed } from '@/utils/dateConversions'
import { RavenChannel } from '@/types/RavenChannelManagement/RavenChannel'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { useEffect } from 'react'

type Mention = {
    name: string
    channel_id: string
    channel_type: RavenChannel['type']
    channel_name: string
    workspace?: string
    is_thread: 0 | 1
    is_direct_message: 0 | 1
    creation: string
    owner: string
    text: string
}

const ActivityPage = () => {
    const { workspaceID } = useParams()
    const { call, result: data, error, loading: isLoading } = useFrappePostCall<{ message: Mention[] }>('raven.api.mentions.get_mentions')

    useEffect(() => {
        void call({ limit: 50, start: 0 })
    }, [])
    const { unread_count } = useUnreadMessageCount()
    const { data: unreadThreads } = useUnreadThreadsCount()

    const unreadMessages = unread_count?.message.reduce((sum, channel) => sum + channel.unread_count, 0) ?? 0
    const threadCount = unreadThreads?.message
        .filter((thread) => !workspaceID || thread.workspace === workspaceID)
        .reduce((sum, thread) => sum + thread.unread_count, 0) ?? 0

    return (
        <HubPage title='Activity' description='Mentions and unread work that need your attention, collected across the workspace.'>
            <Grid columns={{ initial: '1', sm: '3' }} gap='3' mb='7'>
                <ActivityStat icon={<LuActivity />} label='Unread messages' value={unreadMessages} />
                <ActivityStat icon={<LuMessageSquareText />} label='Thread replies' value={threadCount} />
                <ActivityStat icon={<LuAtSign />} label='Recent mentions' value={data?.message.length ?? 0} />
            </Grid>

            <Flex align='center' justify='between' mb='3'>
                <Text size='3' weight='bold'>Mentions</Text>
                {isLoading && <Loader />}
            </Flex>
            <ErrorBanner error={error} />
            <Box className='overflow-hidden rounded-xl border border-gray-4 bg-gray-1 dark:border-gray-6 dark:bg-gray-1'>
                {!isLoading && data?.message.length === 0 && (
                    <Flex direction='column' align='center' justify='center' className='min-h-64 px-6 text-center'>
                        <LuAtSign size={34} className='mb-3 text-gray-8' />
                        <Text weight='bold'>You are all caught up</Text>
                        <Text size='2' color='gray'>New mentions will appear here.</Text>
                    </Flex>
                )}
                {data?.message.map((mention) => <MentionRow key={mention.name} mention={mention} />)}
            </Box>
        </HubPage>
    )
}

const ActivityStat = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) => (
    <Flex align='center' gap='3' className='rounded-xl border border-gray-4 bg-gray-1 p-4 dark:border-gray-6 dark:bg-gray-1'>
        <Flex align='center' justify='center' className='h-10 w-10 rounded-lg bg-accent-3 text-accent-11'>{icon}</Flex>
        <Box>
            <Text as='div' size='5' weight='bold' className='cal-sans'>{value}</Text>
            <Text as='div' size='1' color='gray'>{label}</Text>
        </Box>
    </Flex>
)

const MentionRow = ({ mention }: { mention: Mention }) => {
    const user = useGetUser(mention.owner)
    const workspace = mention.workspace ?? useParams().workspaceID
    const path = mention.is_thread ? `/${workspace}/threads/${mention.channel_id}` : `/${workspace}/${mention.channel_id}?message_id=${mention.name}`

    return (
        <Link to={path} className='block border-b border-gray-4 p-4 transition-colors last:border-0 hover:bg-gray-3 dark:border-gray-6 dark:hover:bg-gray-3'>
            <Flex gap='3' align='start'>
                <UserAvatar src={user?.user_image} alt={user?.full_name ?? mention.owner} size='2' />
                <Box className='min-w-0 flex-1'>
                    <Flex align='center' justify='between' gap='3'>
                        <Flex align='center' gap='1' className='min-w-0'>
                            <Text size='2' weight='bold'>{user?.full_name ?? mention.owner}</Text>
                            {!mention.is_direct_message && (
                                <Text size='1' color='gray' className='flex items-center gap-1 truncate'>
                                    in <ChannelIcon type={mention.channel_type} size='13' /> {mention.channel_name}
                                </Text>
                            )}
                        </Flex>
                        <Text size='1' color='gray' className='shrink-0'>{getTimePassed(mention.creation)}</Text>
                    </Flex>
                    <Text as='div' size='2' className='mt-1 line-clamp-2 [&_p]:m-0 [&_.mention]:text-accent-11'>
                        {parse(mention.text)}
                    </Text>
                </Box>
            </Flex>
        </Link>
    )
}

export const Component = ActivityPage
