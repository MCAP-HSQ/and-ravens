import { useTheme } from '@/ThemeProvider'
import { commandMenuOpenAtom } from '@/components/feature/CommandMenu/CommandMenu'
import { Button, Flex, IconButton, Kbd, Text, Tooltip } from '@radix-ui/themes'
import { useSetAtom } from 'jotai'
import { __ } from '@/utils/translations'
import { HStack } from '../Stack'
import { getKeyboardMetaKeyString } from '@/utils/layout/keyboardKey'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import MentionsButton from './MentionsButton'
import FrappeIcon from '@/components/icons/FrappeIcon'

export const SidebarHeader = () => {

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return (
            <header>
                <Flex
                    justify='between'
                    gap='2'
                    px='3'
                    align='center'
                    width='100%'
                    height='52px'
                    className='border-b border-gray-4 dark:border-gray-6'
                >
                    <CommandMenuButton />
                    <MentionsButton />
                </Flex>
            </header>
        )
    }

    return (
        <header>
            <Flex
                justify='between'
                px='3'
                align='center'
                pt='1'
                height='48px'>
                <Text as='span' size='4' weight='bold' className='pl-1'>And Ravens</Text>
                <Flex align='center' gap='2' className='pr-1 sm:pr-0'>
                    <MentionsButton />
                    <SearchButton />
                    <ColorModeToggleButton />
                </Flex>
            </Flex>
        </header>
    )


}


const CommandMenuButton = () => {

    const setOpen = useSetAtom(commandMenuOpenAtom)

    return <Button
        onClick={() => setOpen(true)}
        aria-label='Open command menu'
        title={__("Open command menu")}
        className='h-8 min-w-0 flex-1 justify-between rounded-[6px] border border-gray-5 bg-gray-1 px-2 font-normal text-gray-10 shadow-none hover:border-gray-6 hover:bg-gray-1 hover:text-gray-12'
        color='gray'
        variant='surface'
    >
        <HStack gap='2'>
            <FrappeIcon name='search' size={14} />
            <Text as='span' size='2' weight='regular'>Search</Text>
        </HStack>
        <Kbd size='1'>{getKeyboardMetaKeyString()}+K</Kbd>
    </Button>
}
/** Only used on mobile */
const SearchButton = () => {

    const setOpen = useSetAtom(commandMenuOpenAtom)

    return (
        <Tooltip content="Search">
            <IconButton
                size={{ initial: '2', md: '1' }}
                aria-label='Open command menu'
                title={__("Open command menu")}
                color='gray'
                className='text-gray-10 hover:bg-gray-3 hover:text-gray-12'
                variant='ghost'
                onClick={() => setOpen(true)}
            >
                <FrappeIcon name='search' />
            </IconButton>
        </Tooltip>
    )
}

/** Only used on mobile */
const ColorModeToggleButton = () => {

    const { appearance, setAppearance } = useTheme()

    const toggleTheme = () => {
        if (appearance === 'light') {
            setAppearance('dark')
        } else {
            setAppearance('light')
        }
    }

    return <Flex align='center' justify='center' pr='1'>
        <IconButton
            size={{ initial: '2', md: '1' }}
            aria-label='Toggle theme'
            title={__("Toggle theme")}
            color='gray'
            className='text-gray-10 hover:bg-gray-3 hover:text-gray-12'
            variant='ghost'
            onClick={toggleTheme}>
            <FrappeIcon name={appearance === 'light' ? 'moon' : 'sun'} />
        </IconButton>
    </Flex>
}
