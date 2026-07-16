import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { DropdownMenu, Flex } from '@radix-ui/themes'
import useCurrentRavenUser from '@/hooks/useCurrentRavenUser'
import { __ } from '@/utils/translations'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import FrappeIcon from '@/components/icons/FrappeIcon'

export type AvailabilityStatus = 'Available' | 'Away' | 'Do not disturb' | 'Invisible' | ''

export const SetUserAvailabilityMenu = () => {
    const { myProfile, mutate } = useCurrentRavenUser()

    const { call } = useFrappePostCall('raven.api.raven_users.update_raven_user')
    const setAvailabilityStatus = (status: AvailabilityStatus) => {
        call({
            'availability_status': status
        }).then(() => {
            toast.success(__("Updated!"), {
                duration: 600
            })
            mutate()
        }).catch((error) => {
            toast.error(error.message, {
                description: getErrorMessage(error)
            })
            console.error(error)
        })
    }

    return (
        <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>
                <Flex gap={'2'} align='center'>{getStatusText(myProfile?.availability_status ?? '')}</Flex>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
                <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Available')}>
                    {getStatusText('Available')}
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Away')}>
                    {getStatusText('Away')}
                </DropdownMenu.Item>
                <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Do not disturb')}>
                    {getStatusText('Do not disturb')}
                </DropdownMenu.Item>
                <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Invisible')}>
                    {getStatusText('Invisible')}
                </DropdownMenu.Item>
                <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('')}>
                    <FrappeIcon name='rotate-ccw' size={13} /> {__("Reset")}
                </DropdownMenu.Item>
            </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
    )
}

export const getStatusText = (status: AvailabilityStatus) => {
    switch (status) {
        case 'Available':
            return <StatusDot className='bg-green-9' label={__("Available")} />
        case 'Away':
            return <StatusDot className='bg-amber-9' label={__("Away")} />
        case 'Do not disturb':
            return <StatusDot className='bg-red-9' label={__("Do not disturb")} />
        case 'Invisible':
            return <StatusDot className='bg-gray-8' label={__("Invisible")} />
        default:
            return <StatusDot className='bg-green-9' label={__("Available")} />
    }
}

const StatusDot = ({ className, label }: { className: string, label: string }) => (
    <><span aria-hidden='true' className={`h-2 w-2 rounded-full ${className}`} /> {label}</>
)
