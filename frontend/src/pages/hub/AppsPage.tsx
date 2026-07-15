import { Badge, Box, Button, Flex, Grid, Text } from '@radix-ui/themes'
import { ReactNode } from 'react'
import { LuBot, LuCalendarDays, LuCheckCheck, LuFileText, LuFiles, LuMessageSquare, LuSettings, LuVideo } from 'react-icons/lu'
import { Link, useParams } from 'react-router-dom'
import HubPage from '@/components/layout/HubPage'

type AppCard = {
    name: string
    description: string
    icon: ReactNode
    path: string
    external?: boolean
    status: string
}

const AppsPage = () => {
    const { workspaceID } = useParams()
    const apps: AppCard[] = [
        { name: 'Chat', description: 'Channels, direct messages, threads, rich text, files, mentions and reactions.', icon: <LuMessageSquare />, path: `/${workspaceID}`, status: 'Built in' },
        { name: 'Calendar', description: 'View Frappe events and join linked Google Meet sessions.', icon: <LuCalendarDays />, path: `/${workspaceID}/calendar`, status: 'Connected' },
        { name: 'Meetings', description: 'Create an instant Google Meet for everyone in a Raven channel.', icon: <LuVideo />, path: `/${workspaceID}/calls`, status: 'Connected' },
        { name: 'Files', description: 'Search documents and images shared across conversations.', icon: <LuFiles />, path: `/${workspaceID}/files`, status: 'Built in' },
        { name: 'AI agents', description: 'Use Raven bots for summaries, retrieval and Frappe actions.', icon: <LuBot />, path: `/${workspaceID}/ai`, status: 'Built in' },
        { name: 'Approvals', description: 'Review pending Frappe workflow actions and decisions.', icon: <LuCheckCheck />, path: '/app/workflow-action', external: true, status: 'Frappe' },
        { name: 'Notes', description: 'Open Frappe notes alongside your team conversations.', icon: <LuFileText />, path: '/app/note', external: true, status: 'Frappe' },
        { name: 'Administration', description: 'Manage workspaces, people, integrations, notifications and automation.', icon: <LuSettings />, path: '/settings', status: 'Admin' },
    ]

    return (
        <HubPage title='Apps' description='The collaboration tools already connected to this And Ravens workspace.'>
            <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap='4'>
                {apps.map((app) => (
                    <Box key={app.name} className='group rounded-xl border border-gray-4 bg-gray-1 p-5 transition-colors hover:border-accent-7 dark:border-gray-6 dark:bg-gray-1'>
                        <Flex align='start' justify='between'>
                            <Flex align='center' justify='center' className='h-11 w-11 rounded-xl bg-accent-3 text-xl text-accent-11 transition-colors group-hover:bg-accent-4'>{app.icon}</Flex>
                            <Badge color={app.status === 'Admin' ? 'orange' : app.status === 'Connected' ? 'green' : 'gray'}>{app.status}</Badge>
                        </Flex>
                        <Text as='div' size='4' weight='bold' className='cal-sans mt-5'>{app.name}</Text>
                        <Text as='p' size='2' color='gray' className='mb-5 mt-1 min-h-14'>{app.description}</Text>
                        <Button asChild variant='soft' className='w-full'>
                            {app.external ? <a href={app.path}>Open {app.name}</a> : <Link to={app.path}>Open {app.name}</Link>}
                        </Button>
                    </Box>
                ))}
            </Grid>
        </HubPage>
    )
}

export const Component = AppsPage
