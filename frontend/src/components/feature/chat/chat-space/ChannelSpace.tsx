import { Box } from '@radix-ui/themes'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChannelHeader } from '../../chat-header/ChannelHeader'
import { useParams } from 'react-router-dom'
import TabbableModule, { TabbableModuleTab, TabbableModuleTabConfig } from '@/components/layout/TabbableModule/TabbableModule'
import { getChannelTabRegistry } from '@/modules/channelTabRegistry'
import clsx from 'clsx'
import { useCallback, useMemo } from 'react'
import { useFrappeEventListener, useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'

type ChannelTabRecord = {
    id: string
    app_id: string
    display_name: string
    tab_type: 'Static' | 'Configurable'
    position: number
    configuration: Record<string, unknown>
}

type ChannelApp = {
    app_id: string
    label: string
    description: string
    icon: string
    tab_type: 'Static' | 'Configurable'
}

type ChannelTabsPayload = {
    tabs: ChannelTabRecord[]
    available_apps: ChannelApp[]
    can_manage: boolean
}

interface ChannelSpaceProps {
    channelData: ChannelListItem
}

export const ChannelSpace = ({ channelData }: ChannelSpaceProps) => {
    const { threadID } = useParams()
    const registry = useMemo(() => getChannelTabRegistry(channelData), [channelData])
    const definitions = useMemo(() => new Map(registry.map((tab) => [tab.id, tab])), [registry])
    const { data, error, isLoading, mutate } = useFrappeGetCall<{ message: ChannelTabsPayload }>(
        'raven.api.channel_tabs.get_channel_tabs',
        { channel_id: channelData.name },
        `channel-tabs:${channelData.name}`,
        { revalidateOnFocus: true },
    )
    const { call: createTab } = useFrappePostCall<{ message: ChannelTabRecord }>('raven.api.channel_tabs.create_channel_tab')
    const { call: renameTab } = useFrappePostCall('raven.api.channel_tabs.rename_channel_tab')
    const { call: removeTab } = useFrappePostCall('raven.api.channel_tabs.remove_channel_tab')

    useFrappeEventListener('raven:channel_tabs_updated', (payload: { channel_id?: string }) => {
        if (payload.channel_id === channelData.name) void mutate()
    })

    const installedTabs = useMemo<TabbableModuleTab[]>(() => {
        const required = registry.filter((tab) => tab.required)
        const optional = (data?.message.tabs ?? []).flatMap((record) => {
            const definition = definitions.get(record.app_id)
            if (!definition) return []
            return [{
                ...definition,
                id: record.id,
                appID: record.app_id,
                label: record.display_name,
                required: false,
                kind: record.tab_type === 'Static' ? 'static' as const : 'configurable' as const,
            }]
        })
        return [...required, ...optional]
    }, [data?.message.tabs, definitions, registry])

    const availableTabs = useMemo<TabbableModuleTab[]>(() => (
        (data?.message.available_apps ?? []).flatMap((app) => {
            const definition = definitions.get(app.app_id)
            if (!definition) return []
            return [{
                ...definition,
                id: app.app_id,
                appID: app.app_id,
                label: app.label,
                description: app.description,
                kind: app.tab_type === 'Static' ? 'static' as const : 'configurable' as const,
            }]
        })
    ), [data?.message.available_apps, definitions])

    const onAddTab = useCallback(async (tab: TabbableModuleTab, config: TabbableModuleTabConfig) => {
        const response = await createTab({
            channel_id: channelData.name,
            app_id: tab.appID ?? tab.id,
            display_name: config.label,
            post_to_channel: config.postToChannel,
            idempotency_key: crypto.randomUUID(),
        })
        await mutate()
        return response.message.id
    }, [channelData.name, createTab, mutate])

    const onRenameTab = useCallback(async (tab: TabbableModuleTab, label: string) => {
        await renameTab({ tab_id: tab.id, display_name: label })
        await mutate()
    }, [mutate, renameTab])

    const onRemoveTab = useCallback(async (tab: TabbableModuleTab) => {
        await removeTab({ tab_id: tab.id })
        await mutate()
    }, [mutate, removeTab])

    return (
        <Box>
            <ChannelHeader channelData={channelData} />
            <TabbableModule
                tabs={installedTabs}
                availableTabs={availableTabs}
                defaultTab='posts'
                canManage={data?.message.can_manage ?? false}
                isLoading={isLoading}
                loadError={error ? getErrorMessage(error) : null}
                onRetry={() => void mutate()}
                onAddTab={onAddTab}
                onRenameTab={onRenameTab}
                onRemoveTab={onRemoveTab}
                ariaLabel={`${channelData.channel_name} modules`}
                tabListClassName={clsx(
                    'fixed top-[53px] z-[998] h-11',
                    threadID
                        ? 'w-screen sm:w-[calc((100vw-var(--sidebar-width)-var(--space-8))/2)]'
                        : 'w-screen sm:w-[calc(100vw-var(--sidebar-width)-var(--space-6))]',
                )}
            />
        </Box>
    )
}
