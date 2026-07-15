import { Box, Button, Flex, Grid, Text } from '@radix-ui/themes'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useContext, useState } from 'react'
import FrappeIcon from '@/components/icons/FrappeIcon'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import HubPage from '@/components/layout/HubPage'
import { UserAvatar } from '@/components/common/UserAvatar'
import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { UserListContext } from '@/utils/users/UserListProvider'
import { ChannelListContext, ChannelListContextType } from '@/utils/channel/ChannelListProvider'

const AIPage = () => {
    const { enabledUsers } = useContext(UserListContext)
    const { dm_channels, mutate } = useContext(ChannelListContext) as ChannelListContextType
    const bots = enabledUsers.filter((user) => user.type === 'Bot')
    const { workspaceID } = useParams()
    const navigate = useNavigate()
    const { call, error } = useFrappePostCall<{ message: string }>('raven.api.raven_channel.create_direct_message_channel')
    const [opening, setOpening] = useState<string | null>(null)

    const openBot = async (botID: string) => {
        setOpening(botID)
        const existing = dm_channels.find((channel) => channel.peer_user_id === botID)
        if (existing) {
            navigate(`/${workspaceID}/${existing.name}`)
            setOpening(null)
            return
        }

        try {
            const response = await call({ user_id: botID })
            await mutate()
            navigate(`/${workspaceID}/${response.message}`)
        } catch (exception) {
            toast.error('Could not open AI chat', {
                description: exception instanceof Error ? exception.message : 'The server did not return an error message.',
            })
        } finally {
            setOpening(null)
        }
    }

    return (
        <HubPage
            title='AI'
            description='Talk to Raven agents that can summarize conversations, find information, and perform Frappe actions.'
            actions={<Button asChild variant='soft'><a href='/app/raven-bot' target='_blank' rel='noreferrer'>Manage agents <FrappeIcon name='sliders-horizontal' /></a></Button>}
        >
            <ErrorBanner error={error} />
            <Flex align='center' gap='2' mb='4'>
                <FrappeIcon name='sparkles' className='text-accent-11' />
                <Text size='3' weight='bold'>Available agents</Text>
            </Flex>
            <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap='4'>
                {bots.map((bot) => (
                    <Box key={bot.name} className='rounded-xl border border-gray-4 bg-gray-1 p-5 dark:border-gray-6 dark:bg-gray-1'>
                        <Flex align='start' justify='between' gap='3'>
                            <UserAvatar src={bot.user_image} alt={bot.full_name} size='4' isBot />
                            <Flex align='center' justify='center' className='h-8 w-8 rounded-full bg-accent-3 text-accent-11'><FrappeIcon name='bot' /></Flex>
                        </Flex>
                        <Text as='div' size='3' weight='bold' className='mt-5'>{bot.full_name}</Text>
                        <Text as='p' size='2' color='gray' className='mb-4 mt-1 min-h-10'>{bot.custom_status || 'Ready to help with work in this workspace.'}</Text>
                        <Button onClick={() => openBot(bot.name)} disabled={opening === bot.name} className='w-full'>
                            {opening === bot.name ? <Loader /> : <FrappeIcon name='message-square' />} Chat
                        </Button>
                    </Box>
                ))}
            </Grid>
            {bots.length === 0 && (
                <Flex direction='column' align='center' justify='center' className='min-h-72 rounded-xl border border-dashed border-gray-6 px-6 text-center'>
                    <FrappeIcon name='bot' size={36} className='mb-3 text-gray-8' />
                    <Text weight='bold'>No AI agents are enabled</Text>
                    <Text size='2' color='gray' className='mb-4 max-w-md'>Create a Raven bot, configure its model and tools, then return here to start a conversation.</Text>
                    <Button asChild variant='soft'><a href='/app/raven-bot' target='_blank' rel='noreferrer'>Configure agents</a></Button>
                </Flex>
            )}
        </HubPage>
    )
}

export const Component = AIPage
