import { PropsWithChildren } from 'react'
import { Box, Flex } from '@radix-ui/themes'
import { useParams } from 'react-router-dom'
import clsx from 'clsx'

export const PageHeader = ({ children }: PropsWithChildren) => {

    const { threadID } = useParams()

    return (
        <header className='fixed top-0 bg-gray-1 dark:bg-gray-2' style={{ zIndex: 999 }}>
            <Box
                py='2'
                className={clsx('border-b border-gray-4 px-4 sm:ml-3 sm:px-1 sm:dark:border-gray-6',
                    threadID ? 'sm:w-[calc((100vw-var(--sidebar-width)-var(--space-8))/2)] w-screen' :
                        'sm:w-[calc(100vw-var(--sidebar-width)-var(--space-6))] w-screen')}>
                <Flex justify='between'>
                    {children}
                </Flex>
            </Box>
        </header>
    )
}
