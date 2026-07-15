import { Box, Tooltip } from '@radix-ui/themes'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChannelHeader } from '../../chat-header/ChannelHeader'
import { Link, useParams } from 'react-router-dom'
import TabbableModule from '@/components/layout/TabbableModule/TabbableModule'
import { getChannelTabRegistry } from '@/modules/channelTabRegistry'
import { LuPlus } from 'react-icons/lu'
import clsx from 'clsx'

interface ChannelSpaceProps {
    channelData: ChannelListItem
}

export const ChannelSpace = ({ channelData }: ChannelSpaceProps) => {
    const { workspaceID, threadID } = useParams()
    const tabs = getChannelTabRegistry(channelData)

    return (
        <Box>
            <ChannelHeader channelData={channelData} />
            <TabbableModule
                tabs={tabs}
                defaultTab='posts'
                ariaLabel={`${channelData.channel_name} modules`}
                tabListClassName={clsx(
                    'fixed top-[53px] z-[998] h-11',
                    threadID
                        ? 'w-screen sm:w-[calc((100vw-var(--sidebar-width)-var(--space-8))/2)]'
                        : 'w-screen sm:w-[calc(100vw-var(--sidebar-width)-var(--space-6))]',
                )}
                trailingActions={(
                    <Tooltip content='Browse apps and add another module'>
                        <Link
                            to={`/${workspaceID}/apps`}
                            aria-label='Add a module tab'
                            className='flex h-8 w-8 items-center justify-center rounded-md text-gray-10 hover:bg-gray-3 hover:text-gray-12'
                        >
                            <LuPlus size={17} />
                        </Link>
                    </Tooltip>
                )}
            />
        </Box>
    )
}
