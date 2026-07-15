import { Box, Flex, Heading, Text } from '@radix-ui/themes'
import { PropsWithChildren, ReactNode } from 'react'

type HubPageProps = PropsWithChildren<{
    title: string
    description: string
    eyebrow?: string
    actions?: ReactNode
}>

/** Shared, intentionally quiet shell for the collaboration-hub apps. */
const HubPage = ({ title, description, eyebrow = 'And Ravens', actions, children }: HubPageProps) => (
    <Box className='h-screen overflow-y-auto bg-white dark:bg-gray-2'>
        <Box className='border-b border-gray-4 bg-gray-1 px-5 py-4 dark:border-gray-6 dark:bg-gray-2 sm:px-8'>
            <Flex align='end' justify='between' gap='4' wrap='wrap'>
                <Box>
                    <Text as='div' size='1' weight='bold' className='mb-1 uppercase tracking-[0.18em] text-accent-11'>
                        {eyebrow}
                    </Text>
                    <Heading size='7' className='cal-sans tracking-tight'>{title}</Heading>
                    <Text as='p' size='2' color='gray' className='mt-1 max-w-2xl'>{description}</Text>
                </Box>
                {actions}
            </Flex>
        </Box>
        <Box className='mx-auto w-full max-w-[1120px] p-4 sm:p-8'>
            {children}
        </Box>
    </Box>
)

export default HubPage
