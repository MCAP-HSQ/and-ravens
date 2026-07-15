import { Badge, Box, Button, Flex, Grid, Text } from '@radix-ui/themes'
import { useFrappeGetDocList } from 'frappe-react-sdk'
import dayjs from 'dayjs'
import { useContext, useMemo, useState } from 'react'
import FrappeIcon from '@/components/icons/FrappeIcon'
import HubPage from '@/components/layout/HubPage'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { Loader } from '@/components/common/Loader'
import CreateMeetingDialog from '@/components/feature/integrations/meetings/CreateMeetingDialog'
import { ChannelListContext, ChannelListContextType, ChannelListItem } from '@/utils/channel/ChannelListProvider'

type MeetingEvent = {
    name: string
    subject: string
    starts_on: string
    ends_on?: string
    status?: string
    google_meet_link?: string
}

const CallsPage = () => {
    const { channels } = useContext(ChannelListContext) as ChannelListContextType
    const [selectedChannel, setSelectedChannel] = useState<ChannelListItem | null>(null)
    const recentSince = dayjs().subtract(30, 'day').format('YYYY-MM-DD HH:mm:ss')

    const { data, error, isLoading } = useFrappeGetDocList<MeetingEvent>('Event', {
        fields: ['name', 'subject', 'starts_on', 'ends_on', 'status', 'google_meet_link'],
        filters: [['starts_on', '>=', recentSince], ['google_meet_link', '!=', '']],
        orderBy: { field: 'starts_on', order: 'desc' },
        limit: 20,
    })

    const activeChannels = useMemo(() => channels.filter((channel) => !channel.is_archived).slice(0, 8), [channels])

    return (
        <HubPage title='Calls' description='Start a Google Meet with a channel and return to recent meeting links.'>
            <Text as='div' size='3' weight='bold' mb='3'>Meet now</Text>
            <Grid columns={{ initial: '1', sm: '2', lg: '4' }} gap='3' mb='8'>
                {activeChannels.map((channel) => (
                    <button
                        key={channel.name}
                        type='button'
                        onClick={() => setSelectedChannel(channel)}
                        className='rounded-xl border border-gray-4 bg-gray-1 p-4 text-left transition-colors hover:border-accent-7 hover:bg-accent-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8 dark:border-gray-6 dark:bg-gray-1'
                    >
                        <Flex align='center' justify='between' mb='5'>
                            <Flex align='center' justify='center' className='h-9 w-9 rounded-lg bg-accent-3 text-accent-11'><FrappeIcon name='hash' /></Flex>
                            <FrappeIcon name='video' className='text-gray-9' />
                        </Flex>
                        <Text as='div' size='2' weight='bold' className='truncate'>{channel.channel_name}</Text>
                        <Text as='div' size='1' color='gray'>Start a meeting</Text>
                    </button>
                ))}
                {activeChannels.length === 0 && (
                    <Flex direction='column' align='center' justify='center' className='col-span-full min-h-40 rounded-xl border border-dashed border-gray-6 text-center'>
                        <FrappeIcon name='phone' size={28} className='mb-2 text-gray-8' />
                        <Text weight='bold'>No channels available</Text>
                        <Text size='2' color='gray'>Create or join a channel to start a meeting.</Text>
                    </Flex>
                )}
            </Grid>

            <Flex align='center' justify='between' mb='3'>
                <Text size='3' weight='bold'>Recent meetings</Text>
                {isLoading && <Loader />}
            </Flex>
            <ErrorBanner error={error} />
            <Box className='overflow-hidden rounded-xl border border-gray-4 bg-gray-1 dark:border-gray-6 dark:bg-gray-1'>
                {!isLoading && data?.length === 0 && (
                    <Flex align='center' justify='center' className='min-h-40 text-center'>
                        <Box><Text as='div' weight='bold'>No recent calls</Text><Text size='2' color='gray'>Meetings started from Raven will appear here.</Text></Box>
                    </Flex>
                )}
                {data?.map((meeting) => (
                    <Flex key={meeting.name} align='center' justify='between' gap='4' className='border-b border-gray-4 p-4 last:border-0 dark:border-gray-6'>
                        <Flex align='center' gap='3' className='min-w-0'>
                            <Flex align='center' justify='center' className='h-10 w-10 shrink-0 rounded-full bg-green-3 text-green-11'><FrappeIcon name='video' /></Flex>
                            <Box className='min-w-0'>
                                <Text as='div' size='2' weight='bold' className='truncate'>{meeting.subject}</Text>
                                <Text as='div' size='1' color='gray'>{dayjs(meeting.starts_on).format('D MMM YYYY, HH:mm')}</Text>
                            </Box>
                        </Flex>
                        <Flex align='center' gap='2'>
                            {meeting.status && <Badge color={meeting.status === 'Cancelled' ? 'red' : 'gray'}>{meeting.status}</Badge>}
                            <Button asChild size='1' variant='soft'>
                                <a href={meeting.google_meet_link || `/app/event/${meeting.name}`} target='_blank' rel='noreferrer'>Join <FrappeIcon name='arrow-up-right' /></a>
                            </Button>
                        </Flex>
                    </Flex>
                ))}
            </Box>

            {selectedChannel && (
                <CreateMeetingDialog
                    isOpen={!!selectedChannel}
                    setOpen={(open) => !open && setSelectedChannel(null)}
                    channelData={selectedChannel}
                />
            )}
        </HubPage>
    )
}

export const Component = CallsPage
