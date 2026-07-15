import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DropdownMenu,
    Flex,
    Grid,
    IconButton,
    Spinner,
    Tabs,
    Text,
    TextField,
    Tooltip,
} from '@radix-ui/themes'
import clsx from 'clsx'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import FrappeIcon from '@/components/icons/FrappeIcon'

export type TabbableModuleTabConfig = {
    label: string
    postToChannel: boolean
}

export type TabbableModuleTab = {
    /** Server instance ID for installed tabs; app ID for picker entries. */
    id: string
    appID?: string
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

type TabbableModuleProps = {
    tabs: TabbableModuleTab[]
    availableTabs?: TabbableModuleTab[]
    defaultTab: string
    queryParam?: string
    trailingActions?: ReactNode
    className?: string
    tabListClassName?: string
    panelClassName?: string
    ariaLabel?: string
    canManage?: boolean
    isLoading?: boolean
    loadError?: string | null
    onRetry?: () => void
    onAddTab?: (tab: TabbableModuleTab, config: TabbableModuleTabConfig) => Promise<string | void>
    onRenameTab?: (tab: TabbableModuleTab, label: string) => Promise<void>
    onRemoveTab?: (tab: TabbableModuleTab) => Promise<void>
}

/** Server-controlled tab host with URL deep links and Teams-style app installation. */
const TabbableModule = ({
    tabs,
    availableTabs = [],
    defaultTab,
    queryParam = 'tab',
    trailingActions,
    className,
    tabListClassName,
    panelClassName,
    ariaLabel = 'Module tabs',
    canManage = false,
    isLoading = false,
    loadError,
    onRetry,
    onAddTab,
    onRenameTab,
    onRemoveTab,
}: TabbableModuleProps) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [tabPendingRemoval, setTabPendingRemoval] = useState<TabbableModuleTab | null>(null)
    const [tabPendingRename, setTabPendingRename] = useState<TabbableModuleTab | null>(null)
    const visibleTabs = useMemo(() => tabs.filter((tab) => !tab.hidden), [tabs])
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

    const addTab = async (tab: TabbableModuleTab, config: TabbableModuleTabConfig) => {
        const installedID = await onAddTab?.(tab, config)
        if (installedID) selectTab(installedID)
    }

    const copyTabLink = async () => {
        const url = new URL(window.location.href)
        if (activeTab.id === defaultTab) url.searchParams.delete(queryParam)
        else url.searchParams.set(queryParam, activeTab.id)
        await navigator.clipboard.writeText(url.toString())
        toast.success('Tab link copied')
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
                        {isLoading && <Spinner size='1' aria-label='Loading channel tabs' />}
                        {trailingActions}
                        {canManage && !activeTab.required && (
                            <DropdownMenu.Root>
                                <Tooltip content={`Manage ${activeTab.label} tab`}>
                                    <DropdownMenu.Trigger>
                                        <IconButton size='1' variant='ghost' color='gray' aria-label={`Manage ${activeTab.label} tab`}>
                                            <FrappeIcon name='ellipsis' />
                                        </IconButton>
                                    </DropdownMenu.Trigger>
                                </Tooltip>
                                <DropdownMenu.Content align='end' sideOffset={6}>
                                    <DropdownMenu.Item onSelect={() => void copyTabLink()}>
                                        <FrappeIcon name='copy' /> Copy link to tab
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item onSelect={() => setTabPendingRename(activeTab)}>
                                        <FrappeIcon name='pencil' /> Rename
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Separator />
                                    <DropdownMenu.Item color='red' onSelect={() => setTabPendingRemoval(activeTab)}>
                                        <FrappeIcon name='trash-2' /> Remove tab
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
                        )}
                        {canManage && onAddTab && <AddModuleDialog tabs={availableTabs} onAdd={addTab} />}
                    </Flex>
                </Flex>

                {loadError && (
                    <Flex align='center' justify='between' gap='3' className='border-b border-red-5 bg-red-2 px-5 py-2 text-red-11'>
                        <Flex align='center' gap='2'><FrappeIcon name='triangle-alert' /><Text size='2'>{loadError}</Text></Flex>
                        {onRetry && <Button size='1' variant='soft' color='red' onClick={onRetry}><FrappeIcon name='refresh-cw' /> Retry</Button>}
                    </Flex>
                )}

                <Tabs.Content
                    value={activeTab.id}
                    className={clsx('m-0 p-0 focus:outline-none', panelClassName, activeTab.panelClassName)}
                >
                    {activeTab.render()}
                </Tabs.Content>
            </Tabs.Root>

            <RenameTabDialog
                tab={tabPendingRename}
                onOpenChange={(open) => !open && setTabPendingRename(null)}
                onRename={async (label) => {
                    if (!tabPendingRename || !onRenameTab) return
                    await onRenameTab(tabPendingRename, label)
                    setTabPendingRename(null)
                }}
            />
            <RemoveTabDialog
                tab={tabPendingRemoval}
                onOpenChange={(open) => !open && setTabPendingRemoval(null)}
                onRemove={async () => {
                    if (!tabPendingRemoval || !onRemoveTab) return
                    await onRemoveTab(tabPendingRemoval)
                    selectTab(defaultTab)
                    setTabPendingRemoval(null)
                }}
            />
        </>
    )
}

type AddDialogStep = 'picker' | 'details' | 'configure' | 'saving'

const AddModuleDialog = ({
    tabs,
    onAdd,
}: {
    tabs: TabbableModuleTab[]
    onAdd: (tab: TabbableModuleTab, config: TabbableModuleTabConfig) => Promise<void>
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
            await onAdd(selectedTab, { label: tabName.trim(), postToChannel })
            setDialogOpen(false)
        } catch (exception) {
            setError(exception instanceof Error ? exception.message : 'The tab could not be added.')
            setStep((selectedTab.kind ?? 'configurable') === 'static' ? 'details' : 'configure')
        }
    }

    return (
        <Dialog.Root open={open} onOpenChange={setDialogOpen}>
            <Tooltip content='Add a tab'>
                <Dialog.Trigger>
                    <IconButton size='1' variant='ghost' color='gray' aria-label='Add a tab'>
                        <FrappeIcon name='plus' />
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
                                <TextField.Slot><FrappeIcon name='search' /></TextField.Slot>
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
                                            {tab.icon || <FrappeIcon name='layout-grid' />}
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

                {(step === 'details' || (step === 'saving' && selectedTab?.kind === 'static')) && selectedTab && (
                    <Box>
                        <Box className='px-6 py-5'>
                            <Button variant='ghost' color='gray' size='1' mb='5' disabled={step === 'saving'} onClick={() => setStep('picker')}><FrappeIcon name='arrow-left' /> Back</Button>
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
                            <Flex align='center' gap='2' mt='5'>
                                <Checkbox id='post-static-module-tab' checked={postToChannel} disabled={step === 'saving'} onCheckedChange={(checked) => setPostToChannel(checked === true)} />
                                <Text as='label' htmlFor='post-static-module-tab' size='2'>Post to the channel about this tab</Text>
                            </Flex>
                            {error && <Box className='mt-5 rounded-md bg-red-3 px-3 py-2 text-red-11'><Text size='2'>{error}</Text></Box>}
                        </Box>
                        <Flex justify='end' gap='2' className='border-t border-gray-4 px-6 py-4 dark:border-gray-6'>
                            <Button variant='soft' color='gray' disabled={step === 'saving'} onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button disabled={step === 'saving'} onClick={() => void beginAdd()}>{step === 'saving' ? 'Adding...' : 'Add'}</Button>
                        </Flex>
                    </Box>
                )}

                {(step === 'configure' || (step === 'saving' && selectedTab?.kind !== 'static')) && selectedTab && (
                    <Box>
                        <Box className='px-6 py-5'>
                            <Button variant='ghost' color='gray' size='1' mb='5' disabled={step === 'saving'} onClick={() => setStep('details')}><FrappeIcon name='arrow-left' /> Back</Button>
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
                            <Button disabled={step === 'saving' || !tabName.trim()} onClick={() => void saveTab()}>{step === 'saving' ? 'Saving...' : 'Save'}</Button>
                        </Flex>
                    </Box>
                )}
            </Dialog.Content>
        </Dialog.Root>
    )
}

const RenameTabDialog = ({
    tab,
    onOpenChange,
    onRename,
}: {
    tab: TabbableModuleTab | null
    onOpenChange: (open: boolean) => void
    onRename: (label: string) => Promise<void>
}) => {
    const [label, setLabel] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLabel(tab?.label ?? '')
        setError(null)
    }, [tab])

    const save = async () => {
        if (!label.trim()) return
        setSaving(true)
        setError(null)
        try {
            await onRename(label.trim())
        } catch (exception) {
            setError(exception instanceof Error ? exception.message : 'The tab could not be renamed.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog.Root open={!!tab} onOpenChange={onOpenChange}>
            <Dialog.Content maxWidth='440px'>
                <Dialog.Title>Rename tab</Dialog.Title>
                <Dialog.Description color='gray'>This name is shown to everyone in the channel.</Dialog.Description>
                <TextField.Root mt='5' value={label} maxLength={80} disabled={saving} onChange={(event) => setLabel(event.target.value)} autoFocus />
                {error && <Text as='div' size='2' color='red' mt='3'>{error}</Text>}
                <Flex justify='end' gap='2' mt='6'>
                    <Button variant='soft' color='gray' disabled={saving} onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button disabled={saving || !label.trim()} onClick={() => void save()}>{saving ? 'Saving...' : 'Save'}</Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    )
}

const RemoveTabDialog = ({
    tab,
    onOpenChange,
    onRemove,
}: {
    tab: TabbableModuleTab | null
    onOpenChange: (open: boolean) => void
    onRemove: () => Promise<void>
}) => {
    const [removing, setRemoving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => setError(null), [tab])

    const remove = async () => {
        setRemoving(true)
        setError(null)
        try {
            await onRemove()
        } catch (exception) {
            setError(exception instanceof Error ? exception.message : 'The tab could not be removed.')
        } finally {
            setRemoving(false)
        }
    }

    return (
        <Dialog.Root open={!!tab} onOpenChange={onOpenChange}>
            <Dialog.Content maxWidth='440px'>
                <Dialog.Title>Remove {tab?.label}?</Dialog.Title>
                <Dialog.Description color='gray'>This removes the tab for everyone in the channel. It does not delete the underlying app data.</Dialog.Description>
                {error && <Text as='div' size='2' color='red' mt='3'>{error}</Text>}
                <Flex justify='end' gap='2' mt='6'>
                    <Button variant='soft' color='gray' disabled={removing} onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button color='red' disabled={removing} onClick={() => void remove()}>{removing ? 'Removing...' : 'Remove'}</Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    )
}

export default TabbableModule
