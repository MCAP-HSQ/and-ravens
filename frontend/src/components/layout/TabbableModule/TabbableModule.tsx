import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DropdownMenu,
    Flex,
    Grid,
    IconButton,
    Tabs,
    Text,
    TextField,
    Tooltip,
} from '@radix-ui/themes'
import clsx from 'clsx'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { BiDotsHorizontalRounded } from 'react-icons/bi'
import { LuArrowLeft, LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu'
import { useSearchParams } from 'react-router-dom'

export type TabbableModuleTabConfig = {
    label: string
    postToChannel: boolean
}

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
    disabledReason?: string
    hidden?: boolean
    kind?: 'static' | 'configurable'
    panelClassName?: string
}

type InstalledTab = {
    id: string
    label?: string
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
    onAddTab?: (tab: TabbableModuleTab, config: TabbableModuleTabConfig) => Promise<void> | void
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
    onAddTab,
}: TabbableModuleProps) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const requiredTabs = useMemo(() => tabs.filter((tab) => tab.required).map((tab) => ({ id: tab.id })), [tabs])
    const [installedTabs, setInstalledTabs] = useState<InstalledTab[]>(requiredTabs)
    const [tabPendingRemoval, setTabPendingRemoval] = useState<TabbableModuleTab | null>(null)

    useEffect(() => {
        const validTabIDs = new Set(tabs.map((tab) => tab.id))
        let storedTabs: InstalledTab[] = []
        if (storageKey) {
            try {
                const parsed = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as unknown
                if (Array.isArray(parsed)) {
                    storedTabs = parsed.flatMap((item) => {
                        if (typeof item === 'string') return [{ id: item }]
                        if (item && typeof item === 'object' && 'id' in item && typeof item.id === 'string') {
                            return [{ id: item.id, label: 'label' in item && typeof item.label === 'string' ? item.label : undefined }]
                        }
                        return []
                    })
                }
            } catch {
                storedTabs = []
            }
        }

        const merged = [...requiredTabs, ...storedTabs.filter((tab) => validTabIDs.has(tab.id))]
        setInstalledTabs(merged.filter((tab, index) => merged.findIndex((candidate) => candidate.id === tab.id) === index))
    }, [storageKey, requiredTabs, tabs])

    const installedTabIDs = useMemo(() => installedTabs.map((tab) => tab.id), [installedTabs])
    const visibleTabs = useMemo(
        () => tabs
            .filter((tab) => !tab.hidden && installedTabIDs.includes(tab.id))
            .map((tab) => ({
                ...tab,
                label: installedTabs.find((installed) => installed.id === tab.id)?.label || tab.label,
            })),
        [installedTabIDs, installedTabs, tabs],
    )
    const addableTabs = useMemo(
        () => tabs.filter((tab) => !tab.hidden && !installedTabIDs.includes(tab.id)),
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
        if (tabID === defaultTab) next.delete(queryParam)
        else next.set(queryParam, tabID)
        setSearchParams(next)
    }

    const persistTabs = (nextTabs: InstalledTab[]) => {
        setInstalledTabs(nextTabs)
        if (storageKey) localStorage.setItem(storageKey, JSON.stringify(nextTabs))
    }

    const addTab = async (tabID: string, config: TabbableModuleTabConfig) => {
        const tab = tabs.find((candidate) => candidate.id === tabID)
        if (!tab || tab.disabled) throw new Error(tab?.disabledReason || 'This app cannot be added here.')
        await onAddTab?.(tab, config)
        if (!installedTabIDs.includes(tabID)) {
            persistTabs([...installedTabs, { id: tabID, label: config.label === tab.label ? undefined : config.label }])
        }
        selectTab(tabID)
    }

    const removeActiveTab = () => {
        if (activeTab.required) return
        persistTabs(installedTabs.filter((tab) => tab.id !== activeTab.id))
        selectTab(defaultTab)
        setTabPendingRemoval(null)
    }

    return (
        <>
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
                                    <DropdownMenu.Item color='red' onSelect={() => setTabPendingRemoval(activeTab)}>
                                        <LuTrash2 /> Remove tab
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
                        )}
                        {allowAdd && <AddModuleDialog tabs={addableTabs} onAdd={addTab} />}
                    </Flex>
                </Flex>

                <Tabs.Content
                    value={activeTab.id}
                    className={clsx('m-0 p-0 focus:outline-none', panelClassName, activeTab.panelClassName)}
                >
                    {activeTab.render()}
                </Tabs.Content>
            </Tabs.Root>

            <RemoveTabDialog
                tab={tabPendingRemoval}
                onOpenChange={(open) => !open && setTabPendingRemoval(null)}
                onRemove={removeActiveTab}
            />
        </>
    )
}

type AddDialogStep = 'picker' | 'details' | 'configure' | 'saving'

const AddModuleDialog = ({
    tabs,
    onAdd,
}: {
    tabs: TabbableModuleTab[],
    onAdd: (tabID: string, config: TabbableModuleTabConfig) => Promise<void>,
}) => {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<AddDialogStep>('picker')
    const [search, setSearch] = useState('')
    const [selectedTab, setSelectedTab] = useState<TabbableModuleTab | null>(null)
    const [tabName, setTabName] = useState('')
    const [postToChannel, setPostToChannel] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const filteredTabs = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return tabs
        return tabs.filter((tab) => `${tab.label} ${tab.description ?? ''}`.toLowerCase().includes(query))
    }, [search, tabs])

    const reset = () => {
        setStep('picker')
        setSearch('')
        setSelectedTab(null)
        setTabName('')
        setPostToChannel(true)
        setError(null)
    }

    const setDialogOpen = (nextOpen: boolean) => {
        setOpen(nextOpen)
        if (!nextOpen) reset()
    }

    const selectApp = (tab: TabbableModuleTab) => {
        if (tab.disabled) return
        setSelectedTab(tab)
        setTabName(tab.label)
        setError(null)
        setStep('details')
    }

    const beginAdd = async () => {
        if (!selectedTab) return
        if ((selectedTab.kind ?? 'configurable') === 'configurable') {
            setStep('configure')
            return
        }
        await saveTab()
    }

    const saveTab = async () => {
        if (!selectedTab) return
        if (!tabName.trim()) {
            setError('Enter a name for the tab.')
            setStep('configure')
            return
        }
        setError(null)
        setStep('saving')
        try {
            await onAdd(selectedTab.id, { label: tabName.trim(), postToChannel })
            setDialogOpen(false)
        } catch (exception) {
            setError(exception instanceof Error ? exception.message : 'The tab could not be added.')
            setStep('configure')
        }
    }

    return (
        <Dialog.Root open={open} onOpenChange={setDialogOpen}>
            <Tooltip content='Add a tab'>
                <Dialog.Trigger>
                    <IconButton size='1' variant='ghost' color='gray' aria-label='Add a tab'>
                        <LuPlus />
                    </IconButton>
                </Dialog.Trigger>
            </Tooltip>
            <Dialog.Content maxWidth='720px' className='p-0'>
                {step === 'picker' && (
                    <Box>
                        <Box className='border-b border-gray-4 px-6 py-5 dark:border-gray-6'>
                            <Dialog.Title mb='1'>Add a tab</Dialog.Title>
                            <Dialog.Description size='2' color='gray'>Choose an app to add to this channel.</Dialog.Description>
                            <TextField.Root mt='4' value={search} onChange={(event) => setSearch(event.target.value)} placeholder='Search apps' autoFocus>
                                <TextField.Slot><LuSearch /></TextField.Slot>
                            </TextField.Root>
                        </Box>
                        <Box className='max-h-[430px] overflow-y-auto p-5'>
                            <Grid columns={{ initial: '1', sm: '2' }} gap='3'>
                                {filteredTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type='button'
                                        disabled={tab.disabled}
                                        onClick={() => selectApp(tab)}
                                        className='flex min-h-24 items-start gap-3 rounded-lg border border-gray-4 bg-gray-1 p-4 text-left transition-colors hover:border-accent-7 hover:bg-accent-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-6'
                                    >
                                        <Flex align='center' justify='center' className='h-10 w-10 shrink-0 rounded-lg bg-accent-3 text-accent-11'>
                                            {tab.icon || <LuPlus />}
                                        </Flex>
                                        <Box>
                                            <Text as='div' size='2' weight='bold'>{tab.label}</Text>
                                            <Text as='div' size='1' color='gray' className='mt-1'>{tab.disabled ? tab.disabledReason : tab.description}</Text>
                                        </Box>
                                    </button>
                                ))}
                            </Grid>
                            {filteredTabs.length === 0 && (
                                <Flex direction='column' align='center' justify='center' className='min-h-52 text-center'>
                                    <Text weight='bold'>{tabs.length === 0 ? 'All available apps are already tabs' : 'No apps found'}</Text>
                                    <Text size='2' color='gray'>{tabs.length === 0 ? 'Remove an optional tab to add it again.' : 'Try another search.'}</Text>
                                </Flex>
                            )}
                        </Box>
                        <Flex justify='end' className='border-t border-gray-4 px-6 py-4 dark:border-gray-6'>
                            <Button variant='soft' color='gray' onClick={() => setDialogOpen(false)}>Cancel</Button>
                        </Flex>
                    </Box>
                )}

                {step === 'details' && selectedTab && (
                    <Box>
                        <Box className='px-6 py-5'>
                            <Button variant='ghost' color='gray' size='1' mb='5' onClick={() => setStep('picker')}><LuArrowLeft /> Back</Button>
                            <Flex align='start' gap='4'>
                                <Flex align='center' justify='center' className='h-14 w-14 shrink-0 rounded-xl bg-accent-3 text-accent-11'>{selectedTab.icon}</Flex>
                                <Box>
                                    <Dialog.Title mb='1'>{selectedTab.label}</Dialog.Title>
                                    <Dialog.Description color='gray'>{selectedTab.description}</Dialog.Description>
                                </Box>
                            </Flex>
                            <Box className='mt-6 rounded-lg border border-gray-4 bg-gray-1 p-4 dark:border-gray-6'>
                                <Text size='2'>This app will be available as a tab to everyone who can access the channel.</Text>
                            </Box>
                        </Box>
                        <Flex justify='end' gap='2' className='border-t border-gray-4 px-6 py-4 dark:border-gray-6'>
                            <Button variant='soft' color='gray' onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button onClick={() => void beginAdd()}>Add</Button>
                        </Flex>
                    </Box>
                )}

                {(step === 'configure' || step === 'saving') && selectedTab && (
                    <Box>
                        <Box className='px-6 py-5'>
                            <Button variant='ghost' color='gray' size='1' mb='5' disabled={step === 'saving'} onClick={() => setStep('details')}><LuArrowLeft /> Back</Button>
                            <Dialog.Title mb='1'>Configure {selectedTab.label}</Dialog.Title>
                            <Dialog.Description color='gray'>Choose how this tab should appear in the channel.</Dialog.Description>
                            <Box mt='5'>
                                <Text as='label' htmlFor='module-tab-name' size='2' weight='bold'>Tab name</Text>
                                <TextField.Root id='module-tab-name' mt='2' value={tabName} disabled={step === 'saving'} onChange={(event) => setTabName(event.target.value)} />
                            </Box>
                            <Flex align='center' gap='2' mt='5'>
                                <Checkbox id='post-module-tab' checked={postToChannel} disabled={step === 'saving'} onCheckedChange={(checked) => setPostToChannel(checked === true)} />
                                <Text as='label' htmlFor='post-module-tab' size='2'>Post to the channel about this tab</Text>
                            </Flex>
                            {error && <Box className='mt-5 rounded-md bg-red-3 px-3 py-2 text-red-11'><Text size='2'>{error}</Text></Box>}
                        </Box>
                        <Flex justify='end' gap='2' className='border-t border-gray-4 px-6 py-4 dark:border-gray-6'>
                            <Button variant='soft' color='gray' disabled={step === 'saving'} onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button disabled={step === 'saving' || !tabName.trim()} onClick={() => void saveTab()}>{step === 'saving' ? 'Saving…' : 'Save'}</Button>
                        </Flex>
                    </Box>
                )}
            </Dialog.Content>
        </Dialog.Root>
    )
}

const RemoveTabDialog = ({
    tab,
    onOpenChange,
    onRemove,
}: {
    tab: TabbableModuleTab | null,
    onOpenChange: (open: boolean) => void,
    onRemove: () => void,
}) => (
    <Dialog.Root open={!!tab} onOpenChange={onOpenChange}>
        <Dialog.Content maxWidth='440px'>
            <Dialog.Title>Remove {tab?.label}?</Dialog.Title>
            <Dialog.Description color='gray'>This removes the tab from the channel. It does not delete the underlying app data.</Dialog.Description>
            <Flex justify='end' gap='2' mt='6'>
                <Button variant='soft' color='gray' onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button color='red' onClick={onRemove}>Remove</Button>
            </Flex>
        </Dialog.Content>
    </Dialog.Root>
)

export default TabbableModule
