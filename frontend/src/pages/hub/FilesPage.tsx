import { Box } from '@radix-ui/themes'
import { useState } from 'react'
import HubPage from '@/components/layout/HubPage'
import { FileSearch } from '@/components/feature/GlobalSearch/FileSearch'

const FilesPage = () => {
    const [onlyMyChannels, setOnlyMyChannels] = useState(false)
    const [savedOnly, setSavedOnly] = useState(false)

    return (
        <HubPage title='Files' description='Find images and documents shared in channels and direct messages.'>
            <Box className='rounded-xl border border-gray-4 bg-gray-1 p-4 dark:border-gray-6 dark:bg-gray-1 sm:p-6'>
                <FileSearch
                    input=''
                    isOnlyInMyChannels={onlyMyChannels}
                    onToggleMyChannels={() => setOnlyMyChannels((value) => !value)}
                    isSaved={savedOnly}
                    onToggleSaved={() => setSavedOnly((value) => !value)}
                />
            </Box>
        </HubPage>
    )
}

export const Component = FilesPage
