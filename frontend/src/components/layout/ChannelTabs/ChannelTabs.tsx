import { Flex, Text, Tooltip } from '@radix-ui/themes'
import clsx from 'clsx'
import { LuPlus } from 'react-icons/lu'
import { Link, useLocation, useParams } from 'react-router-dom'

type ChannelTab = 'posts' | 'shared'

const ChannelTabs = () => {
    const { workspaceID, channelID, threadID } = useParams()
    const location = useLocation()
    const activeTab: ChannelTab = new URLSearchParams(location.search).get('tab') === 'shared' ? 'shared' : 'posts'
    const channelPath = `/${workspaceID}/${channelID}`

    return (
        <Flex
            align='end'
            gap='1'
            className={clsx(
                'fixed top-[53px] z-[998] h-11 border-b border-gray-4 bg-white px-4 dark:border-gray-6 dark:bg-gray-2',
                threadID
                    ? 'w-screen sm:w-[calc((100vw-var(--sidebar-width)-var(--space-8))/2)]'
                    : 'w-screen sm:w-[calc(100vw-var(--sidebar-width)-var(--space-6))]',
            )}
        >
            <ChannelTabLink label='Posts' to={channelPath} active={activeTab === 'posts'} />
            <ChannelTabLink label='Shared' to={`${channelPath}?tab=shared`} active={activeTab === 'shared'} />
            <Tooltip content='Browse apps and add more workspace tools'>
                <Link
                    to={`/${workspaceID}/apps`}
                    aria-label='Add a tab'
                    className='mb-1 flex h-8 w-8 items-center justify-center rounded-md text-gray-10 hover:bg-gray-3 hover:text-gray-12'
                >
                    <LuPlus size={17} />
                </Link>
            </Tooltip>
        </Flex>
    )
}

const ChannelTabLink = ({ label, to, active }: { label: string, to: string, active: boolean }) => (
    <Link
        to={to}
        aria-current={active ? 'page' : undefined}
        className={clsx(
            'relative flex h-10 items-center px-3 text-gray-10 transition-colors hover:text-gray-12',
            active && 'text-gray-12',
        )}
    >
        <Text size='2' weight={active ? 'bold' : 'medium'}>{label}</Text>
        {active && <span className='absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent-9' />}
    </Link>
)

export default ChannelTabs
