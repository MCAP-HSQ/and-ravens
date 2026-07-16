import { useContext, useState } from 'react'
import { UserContext } from '../../../utils/auth/UserProvider'
import { useUserData } from '@/hooks/useUserData'
import { Box, DropdownMenu, IconButton, Separator, Tooltip } from '@radix-ui/themes'
import { UserAvatar } from '@/components/common/UserAvatar'
import useCurrentRavenUser from '@/hooks/useCurrentRavenUser'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { useNavigate } from 'react-router-dom'
import { SetUserAvailabilityMenu } from '@/components/feature/userSettings/AvailabilityStatus/SetUserAvailabilityMenu'
import { SetCustomStatusModal } from '@/components/feature/userSettings/CustomStatus/SetCustomStatusModal'
import PushNotificationToggle from '@/components/feature/userSettings/PushNotifications/PushNotificationToggle'
import { __ } from '@/utils/translations'
import { Stack } from '../Stack'
import FrappeIcon from '@/components/icons/FrappeIcon'

export const SidebarFooter = () => {

    const userData = useUserData()
    const { logout } = useContext(UserContext)

    const [isUserStatusModalOpen, setUserStatusModalOpen] = useState(false)

    const { myProfile } = useCurrentRavenUser()
    const isActive = useIsUserActive(userData.name)

    const navigate = useNavigate()

    return <Stack className='mx-auto py-0' align='center' gap='1'>
        <Box>
            <Tooltip content="Workspace Explorer" side='right'>
                <IconButton aria-label='Workspace Explorer' size='2' color='gray' variant='ghost' className='text-gray-10 hover:bg-gray-3 hover:text-gray-12' onClick={() => navigate('/workspace-explorer')}>
                    <FrappeIcon name='compass' />
                </IconButton>
            </Tooltip>
        </Box>
        <Box>
            <Tooltip content="Settings" side='right'>
                <IconButton aria-label='Settings' size='2' color='gray' variant='ghost' className='text-gray-10 hover:bg-gray-3 hover:text-gray-12' onClick={() => navigate('/settings/profile')}>
                    <FrappeIcon name='settings' />
                </IconButton>
            </Tooltip>
        </Box>
        <Separator size='4' className='bg-gray-4 dark:bg-gray-6' />
        <Box className='pt-1 sm:pb-0'>
            <DropdownMenu.Root>
                <Tooltip content="Options" side='right'>
                    <DropdownMenu.Trigger>
                        <IconButton aria-label='Options' color='gray' variant='ghost' className='p-0 bg-transparent hover:bg-transparent'>
                            <UserAvatar
                                src={myProfile?.user_image}
                                alt={myProfile?.full_name}
                                size='2'
                                className='transition-colors hover:ring-2 hover:ring-gray-5'
                                availabilityStatus={myProfile?.availability_status}
                                isActive={isActive} />

                        </IconButton>
                    </DropdownMenu.Trigger>
                </Tooltip>
                <DropdownMenu.Content variant='soft' align='start' side='right' sideOffset={8}>
                    <SetUserAvailabilityMenu />
                    <DropdownMenu.Item color='gray' className={'flex justify-normal gap-2'} onClick={() => setUserStatusModalOpen(true)}>
                        <FrappeIcon name='smile' size={14} /> {__("Set custom status")}
                    </DropdownMenu.Item>
                    <PushNotificationToggle />
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item color='red' className={'flex justify-normal gap-2'} onClick={logout}>
                        <FrappeIcon name='log-out' size={14} /> {__("Log Out")}
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

        </Box>
        <SetCustomStatusModal isOpen={isUserStatusModalOpen} onOpenChange={setUserStatusModalOpen} />
    </Stack>
}
