import { Box, Flex, Text, Tooltip } from '@radix-ui/themes'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useContext, useMemo } from 'react'
import { NavLink, useLocation, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { ChannelListContext, ChannelListContextType } from '@/utils/channel/ChannelListProvider'
import { __ } from '@/utils/translations'
import FrappeIcon from '@/components/icons/FrappeIcon'

type AppRailItem = {
    label: string
    path: string
    icon: React.ReactNode
    end?: boolean
    badge?: number
    active?: boolean
}

const APP_ICON_SIZE = 20

/**
 * Product-level navigation inspired by the Teams app rail while preserving
 * Raven's workspace and channel navigation as the next two levels.
 */
const AppRail = () => {
    const { workspaceID } = useParams()
    const location = useLocation()
    const { channels } = useContext(ChannelListContext) as ChannelListContextType
    const { data: mentionsCount } = useFrappeGetCall<{ message: number }>(
        'raven.api.mentions.get_unread_mention_count',
        undefined,
        undefined,
        { revalidateOnFocus: true },
    )

    const firstChannel = useMemo(
        () => channels.find((channel) => channel.workspace === workspaceID && !channel.is_archived),
        [channels, workspaceID],
    )

    if (!workspaceID) return null

    const base = `/${workspaceID}`
    const chatPath = firstChannel ? `${base}/${firstChannel.name}` : base
    const workspaceSection = location.pathname.slice(base.length).split('/').filter(Boolean)[0]
    const isChatRoute = !workspaceSection || !['activity', 'calendar', 'calls', 'files', 'ai', 'apps'].includes(workspaceSection)

    const items: AppRailItem[] = [
        { label: 'Activity', path: `${base}/activity`, icon: <FrappeIcon name='activity' size={APP_ICON_SIZE} />, badge: mentionsCount?.message },
        { label: 'Chat', path: chatPath, icon: <FrappeIcon name='message-square' size={APP_ICON_SIZE} />, active: isChatRoute },
        { label: 'Calendar', path: `${base}/calendar`, icon: <FrappeIcon name='calendar-days' size={APP_ICON_SIZE} /> },
        { label: 'Calls', path: `${base}/calls`, icon: <FrappeIcon name='phone' size={APP_ICON_SIZE} /> },
        { label: 'Files', path: `${base}/files`, icon: <FrappeIcon name='files' size={APP_ICON_SIZE} /> },
        { label: 'AI', path: `${base}/ai`, icon: <FrappeIcon name='bot' size={APP_ICON_SIZE} /> },
        { label: 'Apps', path: `${base}/apps`, icon: <FrappeIcon name='layout-grid' size={APP_ICON_SIZE} /> },
    ]

    return (
        <Flex
            direction='column'
            align='center'
            justify='between'
            className='and-ravens-app-rail h-screen w-[4.5rem] shrink-0 border-r border-gray-4 bg-gray-1 py-2 dark:border-gray-6 dark:bg-gray-1'
        >
            <Flex direction='column' align='center' gap='2' width='100%'>
                <NavLink to={chatPath} aria-label={__('Open And Ravens chat')} className='mb-1'>
                    <Flex
                        align='center'
                        justify='center'
                        className='h-10 w-10 rounded-xl bg-gray-12 text-white shadow-sm dark:bg-gray-12 dark:text-gray-1'
                    >
                        <Text size='2' weight='bold' className='cal-sans tracking-tight'>A/R</Text>
                    </Flex>
                </NavLink>
                <Box className='h-px w-8 bg-gray-4 dark:bg-gray-6' />
                <Flex direction='column' align='center' gap='1' width='100%'>
                    {items.map((item) => <AppRailLink key={item.label} item={item} />)}
                </Flex>
            </Flex>

            <AppRailLink item={{
                label: 'Settings',
                path: '/settings',
                icon: <FrappeIcon name='settings' size={APP_ICON_SIZE} />,
            }} />
        </Flex>
    )
}

const AppRailLink = ({ item }: { item: AppRailItem }) => (
    <Tooltip content={__(item.label)} side='right'>
        <NavLink
            to={item.path}
            end={item.end}
            aria-label={__(item.label)}
            className={({ isActive }) => clsx(
                'and-ravens-app-link group relative flex h-[3.35rem] w-full flex-col items-center justify-center gap-0.5 rounded-md text-gray-10 outline-none transition-colors hover:bg-gray-3 hover:text-gray-12 focus-visible:ring-2 focus-visible:ring-accent-8 dark:hover:bg-gray-4',
                (item.active ?? isActive) && 'is-active bg-accent-3 text-accent-11 hover:bg-accent-4 hover:text-accent-12',
            )}
        >
            <span aria-hidden='true'>{item.icon}</span>
            <Text size='1' weight='medium' className='leading-none'>{__(item.label)}</Text>
            {!!item.badge && item.badge > 0 && (
                <Box className='absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-10 px-1 text-[10px] font-semibold leading-none text-white'>
                    {item.badge > 99 ? '99+' : item.badge}
                </Box>
            )}
        </NavLink>
    </Tooltip>
)

export default AppRail
