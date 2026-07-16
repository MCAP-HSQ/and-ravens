import { Avatar, Box, Flex, ScrollArea, Text, Tooltip } from '@radix-ui/themes'
import { HStack, Stack } from '../Stack'
import useFetchWorkspaces, { WorkspaceFields } from '@/hooks/fetchers/useFetchWorkspaces'
import { SidebarFooter } from './SidebarFooter'
import AddWorkspaceSidebarButton from '@/components/feature/workspaces/AddWorkspaceSidebarButton'
import { Link, useLocation, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { useContext, useMemo } from 'react'
import useUnreadMessageCount from '@/hooks/useUnreadMessageCount'
import { ChannelListContext, ChannelListContextType } from '@/utils/channel/ChannelListProvider'
import { generateAvatarColor } from '@/components/feature/selectDropdowns/GenerateAvatarColor'
import { getInitials } from '@/components/common/UserAvatar'
import { useSetAtom } from 'jotai'
import { lastChannelAtom, lastWorkspaceAtom } from '@/utils/lastVisitedAtoms'
import { useResetAtom } from 'jotai/utils'
import useUnreadThreadsCount from '@/hooks/useUnreadThreadsCount'

const WorkspacesSidebar = () => {

    const { data } = useFetchWorkspaces()

    const { unread_count } = useUnreadMessageCount()
    const { data: unreadThreads } = useUnreadThreadsCount()

    const { channels } = useContext(ChannelListContext) as ChannelListContextType

    const myWorkspaces: (WorkspaceFields & { unread_count: number })[] = useMemo(() => {
        const myWorkspaces: WorkspaceFields[] = data?.message.filter((workspace) => !!workspace.workspace_member_name) || []
        // Add unread counts to each workspace
        const workspace_unread_counts: Record<string, number> = {}

        // Loop over all channels in the channels context and find it's unread count and add it to the workspace_unread_counts object
        channels.forEach((channel) => {
            if (channel.workspace) {
                let unreadCounts = unread_count?.message?.find((c) => c.name === channel.name)?.unread_count || 0
                workspace_unread_counts[channel.workspace] = (workspace_unread_counts?.[channel.workspace] || 0) + unreadCounts
            }
        })

        // Loop over all unread threads and add it to the workspace_unread_counts object
        unreadThreads?.message.forEach((thread) => {
            if (thread.workspace) {
                workspace_unread_counts[thread.workspace] = (workspace_unread_counts?.[thread.workspace] || 0) + thread.unread_count
            }
        })

        const myWorkspacesWithUnreadCounts = myWorkspaces.map((workspace) => {
            return {
                ...workspace,
                unread_count: workspace_unread_counts[workspace.name] || 0
            }
        })

        return myWorkspacesWithUnreadCounts
    }, [data, channels, unread_count, unreadThreads])

    return (
        <Stack className='h-screen w-14 border-r border-gray-4 bg-gray-1 p-0 pb-3 dark:border-gray-6 dark:bg-gray-1' justify='between'>
            <ScrollArea className='h-[calc(100vh-7rem)]' type='hover' scrollbars='vertical'>
                <Stack align='center' className='px-1.5 py-2' gap='2'>
                    {myWorkspaces.map((workspace) => (
                        <WorkspaceItem workspace={workspace} key={workspace.name} />
                    ))}
                    <AddWorkspaceSidebarButton />
                </Stack>
            </ScrollArea>
            <Stack>
                <SidebarFooter />
            </Stack>
        </Stack>
    )
}

const WorkspaceItem = ({ workspace }: { workspace: WorkspaceFields & { unread_count: number } }) => {

    const { workspaceID } = useParams()

    const isSelected = workspaceID === workspace.name

    let logo = workspace.logo || ''

    if (!logo && workspace.workspace_name === 'Raven') {
        logo = '/assets/raven/raven-logo.png'
    }

    const location = useLocation()

    const path = isSelected ? location.pathname : `/${workspace.name}`

    const setLastWorkspace = useSetAtom(lastWorkspaceAtom)
    const resetLastChannel = useResetAtom(lastChannelAtom)

    const openWorkspace = () => {
        setLastWorkspace(workspace.name)
        resetLastChannel()
    }

    return <HStack position='relative' align='center' className='group'>
        <Box className={clsx('absolute -left-2.5 w-0.5 rounded-r-full bg-accent-9 transition-all duration-150',
            isSelected ? 'h-6' : 'h-0 group-hover:h-3',
            workspace.unread_count > 0 && !isSelected && 'h-1.5'
        )} />
        <Flex align='center' gap='2' width='100%' justify='between' asChild>
            <Tooltip content={workspace.workspace_name} side='right'>
                <Link aria-label={`Switch to ${workspace.workspace_name} workspace`}
                    className='cursor-pointer rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-accent-8'
                    to={path}
                    onClick={openWorkspace}
                >
                    <WorkspaceLogo workspace_name={workspace.workspace_name} logo={logo} />
                </Link>
            </Tooltip>
        </Flex>
        {workspace.unread_count > 0 &&
            <Box className='absolute -bottom-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-gray-1 bg-red-10 px-0.5 text-white dark:border-gray-1'>
                <Text as='span' size='1' weight='medium'>{workspace.unread_count > 99 ? '99+' : workspace.unread_count}</Text>
            </Box>
        }
    </HStack>
}

const WorkspaceLogo = ({ workspace_name, logo }: { workspace_name: string, logo: string }) => {

    const { color, fallback } = useMemo(() => {
        const fallback = getInitials(workspace_name)
        const color = generateAvatarColor(workspace_name)

        return {
            color,
            fallback
        }
    }, [workspace_name])
    return <Box>
        <Avatar
            size='2'
            radius='medium'
            className='transition-colors hover:ring-2 hover:ring-gray-5'
            color={color}
            loading='eager'
            fallback={fallback}
            src={logo}
        />
    </Box>
}

export default WorkspacesSidebar
