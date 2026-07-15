import { Box, DropdownMenu, Flex, IconButton, Tabs, Text, Tooltip } from '@radix-ui/themes'
import clsx from 'clsx'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { LuPlus, LuTrash2 } from 'react-icons/lu'
import { BiDotsHorizontalRounded } from 'react-icons/bi'
import { useSearchParams } from 'react-router-dom'

export type TabbableModuleTab = {
    /** Stable URL-safe identifier used for selection and deep links. */
    id: string
    label: string
    render: () => ReactNode
    icon?: ReactNode
    badge?: ReactNode
    description?: string
    required?: boolean
    disabled?: boolean
    hidden?: boolean
    panelClassName?: string
}

type TabbableModuleProps = {
    tabs: TabbableModuleTab[]
    defaultTab: string
    queryParam?: string
    trailingActions?: ReactNode
    className?: string
    tabListClassName?: string
    panelClassName?: string
    ariaLabel?: string
    storageKey?: string
    allowAdd?: boolean
}

/**
 * Registry-driven tab host. Consumers register content; this component owns
 * selection, URL state, accessibility, keyboard behavior and lazy panels.
 */
const TabbableModule = ({
    tabs,
    defaultTab,
    queryParam = 'tab',
    trailingActions,
    className,
    tabListClassName,
    panelClassName,
    ariaLabel = 'Module tabs',
    storageKey,
    allowAdd = true,
}: TabbableModuleProps) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const requiredTabIDs = useMemo(() => tabs.filter((tab) => tab.required).map((tab) => tab.id), [tabs])
    const [installedTabIDs, setInstalledTabIDs] = useState<string[]>(requiredTabIDs)

    useEffect(() => {
        const validTabIDs = new Set(tabs.map((tab) => tab.id))
        let storedTabIDs: string[] = []
        if (storageKey) {
            try {
                storedTabIDs = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
            } catch {
                storedTabIDs = []
            }
        }
        setInstalledTabIDs(Array.from(new Set([
            ...requiredTabIDs,
            ...storedTabIDs.filter((tabID) => validTabIDs.has(tabID)),
        ])))
    }, [storageKey, requiredTabIDs, tabs])

    const visibleTabs = useMemo(
        () => tabs.filter((tab) => !tab.hidden && installedTabIDs.includes(tab.id)),
        [installedTabIDs, tabs],
    )
    const addableTabs = useMemo(
        () => tabs.filter((tab) => !tab.hidden && !tab.disabled && !installedTabIDs.includes(tab.id)),
        [installedTabIDs, tabs],
    )
    const requestedTab = searchParams.get(queryParam)
    const fallbackTab = visibleTabs.find((tab) => tab.id === defaultTab && !tab.disabled)
        ?? visibleTabs.find((tab) => !tab.disabled)
    const activeTab = visibleTabs.find((tab) => tab.id === requestedTab && !tab.disabled)
        ?? fallbackTab

    if (!activeTab) return null

    const selectTab = (tabID: string) => {
        const next = new URLSearchParams(searchParams)
        if (tabID === defaultTab) {
            next.delete(queryParam)
        } else {
            next.set(queryParam, tabID)
        }
        setSearchParams(next)
    }

    const persistTabs = (tabIDs: string[]) => {
        setInstalledTabIDs(tabIDs)
        if (storageKey) localStorage.setItem(storageKey, JSON.stringify(tabIDs))
    }

    const addTab = (tabID: string) => {
        if (!installedTabIDs.includes(tabID)) persistTabs([...installedTabIDs, tabID])
        selectTab(tabID)
    }

    const removeActiveTab = () => {
        if (activeTab.required) return
        persistTabs(installedTabIDs.filter((tabID) => tabID !== activeTab.id))
        selectTab(defaultTab)
    }

    return (
        <Tabs.Root value={activeTab.id} onValueChange={selectTab} className={className}>
            <Flex
                align='end'
                gap='1'
                aria-label={ariaLabel}
                className={clsx('border-b border-gray-4 bg-white px-4 dark:border-gray-6 dark:bg-gray-2', tabListClassName)}
            >
                <Tabs.List highContrast={false} className='min-w-0 flex-1 overflow-x-auto' aria-label={ariaLabel}>
                    {visibleTabs.map((tab) => (
                        <Tabs.Trigger key={tab.id} value={tab.id} disabled={tab.disabled}>
                            <Flex align='center' gap='1'>
                                {tab.icon && <Box aria-hidden='true'>{tab.icon}</Box>}
                                <Text size='2' weight='medium'>{tab.label}</Text>
                                {tab.badge}
                            </Flex>
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>
                <Flex align='center' gap='1' className='shrink-0 pb-1'>
                    {trailingActions}
                    {!activeTab.required && (
                        <DropdownMenu.Root>
                            <Tooltip content={`Manage ${activeTab.label} tab`}>
                                <DropdownMenu.Trigger>
                                    <IconButton size='1' variant='ghost' color='gray' aria-label={`Manage ${activeTab.label} tab`}>
                                        <BiDotsHorizontalRounded />
                                    </IconButton>
                                </DropdownMenu.Trigger>
                            </Tooltip>
                            <DropdownMenu.Content align='end' sideOffset={6}>
                                <DropdownMenu.Item color='red' onSelect={removeActiveTab}>
                                    <LuTrash2 /> Remove tab
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    )}
                    {allowAdd && <AddModuleMenu tabs={addableTabs} onAdd={addTab} />}
                </Flex>
            </Flex>

            <Tabs.Content
                value={activeTab.id}
                className={clsx('m-0 p-0 focus:outline-none', panelClassName, activeTab.panelClassName)}
            >
                {activeTab.render()}
            </Tabs.Content>
        </Tabs.Root>
    )
}

const AddModuleMenu = ({ tabs, onAdd }: { tabs: TabbableModuleTab[], onAdd: (tabID: string) => void }) => (
    <DropdownMenu.Root>
        <Tooltip content='Add a tab'>
            <DropdownMenu.Trigger>
                <IconButton size='1' variant='ghost' color='gray' aria-label='Add a tab'>
                    <LuPlus />
                </IconButton>
            </DropdownMenu.Trigger>
        </Tooltip>
        <DropdownMenu.Content align='end' sideOffset={6} className='min-w-72'>
            <DropdownMenu.Item disabled className='opacity-100'>
                <Text size='1' weight='bold' className='uppercase tracking-wider text-gray-9'>Add a tab</Text>
            </DropdownMenu.Item>
            {tabs.map((tab) => (
                <DropdownMenu.Item key={tab.id} onSelect={() => onAdd(tab.id)} className='py-2'>
                    <Flex align='start' gap='2'>
                        {tab.icon && <Flex align='center' justify='center' className='mt-0.5 h-7 w-7 shrink-0 rounded-md bg-accent-3 text-accent-11'>{tab.icon}</Flex>}
                        <Box>
                            <Text as='div' size='2' weight='bold'>{tab.label}</Text>
                            {tab.description && <Text as='div' size='1' color='gray'>{tab.description}</Text>}
                        </Box>
                    </Flex>
                </DropdownMenu.Item>
            ))}
            {tabs.length === 0 && (
                <DropdownMenu.Item disabled>All available modules are already tabbed.</DropdownMenu.Item>
            )}
        </DropdownMenu.Content>
    </DropdownMenu.Root>
)

export default TabbableModule
