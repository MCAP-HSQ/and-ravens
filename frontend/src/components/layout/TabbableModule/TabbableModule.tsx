import { Box, Flex, Tabs, Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { ReactNode, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export type TabbableModuleTab = {
    /** Stable URL-safe identifier used for selection and deep links. */
    id: string
    label: string
    render: () => ReactNode
    icon?: ReactNode
    badge?: ReactNode
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
}: TabbableModuleProps) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const visibleTabs = useMemo(() => tabs.filter((tab) => !tab.hidden), [tabs])
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
                {trailingActions && <Flex align='center' className='shrink-0 pb-1'>{trailingActions}</Flex>}
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

export default TabbableModule
