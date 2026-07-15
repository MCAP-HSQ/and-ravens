import { Badge, Box, Button, Flex, Grid, Text } from '@radix-ui/themes'
import { useFrappeGetDocList } from 'frappe-react-sdk'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { LuChevronLeft, LuChevronRight, LuExternalLink, LuVideo } from 'react-icons/lu'
import HubPage from '@/components/layout/HubPage'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { Loader } from '@/components/common/Loader'

type EventRecord = {
    name: string
    subject: string
    starts_on: string
    ends_on?: string
    status?: string
    event_type?: string
    all_day?: 0 | 1
    google_meet_link?: string
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const CalendarPage = () => {
    const [cursor, setCursor] = useState(dayjs().startOf('month'))
    const start = cursor.startOf('month').startOf('week').add(1, 'day')
    const end = start.add(41, 'day').endOf('day')

    const { data, error, isLoading } = useFrappeGetDocList<EventRecord>('Event', {
        fields: ['name', 'subject', 'starts_on', 'ends_on', 'status', 'event_type', 'all_day', 'google_meet_link'],
        filters: [['starts_on', '>=', start.format('YYYY-MM-DD HH:mm:ss')], ['starts_on', '<=', end.format('YYYY-MM-DD HH:mm:ss')]],
        orderBy: { field: 'starts_on', order: 'asc' },
        limit: 100,
    })

    const days = useMemo(() => Array.from({ length: 42 }, (_, index) => start.add(index, 'day')), [start.valueOf()])

    return (
        <HubPage
            title='Calendar'
            description='Frappe events and Google Meet links, in the same workspace as your conversations.'
            actions={<Button asChild variant='soft'><a href='/app/event' target='_blank' rel='noreferrer'>Open event list <LuExternalLink /></a></Button>}
        >
            <Flex align='center' justify='between' mb='4'>
                <Flex align='center' gap='2'>
                    <Button variant='soft' color='gray' onClick={() => setCursor((value) => value.subtract(1, 'month'))} aria-label='Previous month'><LuChevronLeft /></Button>
                    <Button variant='soft' color='gray' onClick={() => setCursor(dayjs().startOf('month'))}>Today</Button>
                    <Button variant='soft' color='gray' onClick={() => setCursor((value) => value.add(1, 'month'))} aria-label='Next month'><LuChevronRight /></Button>
                </Flex>
                <Text size='4' weight='bold' className='cal-sans'>{cursor.format('MMMM YYYY')}</Text>
            </Flex>

            <ErrorBanner error={error} />
            <Box className='overflow-hidden rounded-xl border border-gray-4 dark:border-gray-6'>
                <Grid columns='7' className='border-b border-gray-4 bg-gray-2 dark:border-gray-6'>
                    {WEEKDAYS.map((weekday) => <Text key={weekday} size='1' weight='bold' className='px-2 py-2 text-center uppercase tracking-wider text-gray-10'>{weekday}</Text>)}
                </Grid>
                {isLoading ? <Flex align='center' justify='center' className='h-80'><Loader /></Flex> : (
                    <Grid columns='7'>
                        {days.map((day) => {
                            const dayEvents = data?.filter((event) => dayjs(event.starts_on).isSame(day, 'day')) ?? []
                            return (
                                <Box key={day.format('YYYY-MM-DD')} className='min-h-28 border-b border-r border-gray-4 p-2 last:border-r-0 dark:border-gray-6'>
                                    <Text size='1' weight={day.isSame(dayjs(), 'day') ? 'bold' : 'regular'} className={day.isSame(dayjs(), 'day') ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-9 text-white' : day.month() === cursor.month() ? '' : 'text-gray-8'}>
                                        {day.date()}
                                    </Text>
                                    <Flex direction='column' gap='1' mt='1'>
                                        {dayEvents.slice(0, 3).map((event) => <EventChip key={event.name} event={event} />)}
                                        {dayEvents.length > 3 && <Text size='1' color='gray'>+{dayEvents.length - 3} more</Text>}
                                    </Flex>
                                </Box>
                            )
                        })}
                    </Grid>
                )}
            </Box>
        </HubPage>
    )
}

const EventChip = ({ event }: { event: EventRecord }) => (
    <a href={event.google_meet_link || `/app/event/${event.name}`} target='_blank' rel='noreferrer' className='block truncate rounded-md bg-accent-3 px-2 py-1 text-accent-12 hover:bg-accent-4'>
        <Flex align='center' gap='1'>
            {event.google_meet_link && <LuVideo size={11} />}
            <Text size='1' weight='medium' className='truncate'>{event.all_day ? '' : `${dayjs(event.starts_on).format('HH:mm')} `}{event.subject}</Text>
            {event.status === 'Cancelled' && <Badge size='1' color='red'>Cancelled</Badge>}
        </Flex>
    </a>
)

export const Component = CalendarPage
