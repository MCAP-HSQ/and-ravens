import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from '@/components/layout/Drawer'
import { Stack } from '@/components/layout/Stack'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { hasRavenAdminRole } from '@/utils/roles'
import { Dialog, IconButton, Tooltip } from '@radix-ui/themes'
import AddWorkspaceForm from './AddWorkspaceForm'
import { useBoolean } from '@/hooks/useBoolean'
import { useNavigate } from 'react-router-dom'
import FrappeIcon from '@/components/icons/FrappeIcon'

type Props = {}

const AddWorkspaceSidebarButton = (props: Props) => {

    const isRavenAdmin = hasRavenAdminRole()

    if (!isRavenAdmin) {
        return null
    }

    return <AddWorkspaceModal />
}

const AddWorkspaceModal = () => {

    const isDesktop = useIsDesktop()

    const navigate = useNavigate()

    const [isOpen, { off }, setValue] = useBoolean()

    const onClose = (workspaceID?: string) => {
        if (workspaceID) {
            navigate(`/${workspaceID}`)
        }
        off()
    }

    if (isDesktop) {

        return <Dialog.Root open={isOpen} onOpenChange={setValue}>
            <Tooltip content="Create Workspace" side='right'>
                <Dialog.Trigger>
                    <IconButton
                        color='gray'
                        size='2'
                        variant='ghost'
                        className='border border-dashed border-gray-6 text-gray-10 hover:bg-gray-3 hover:text-gray-12'>
                        <FrappeIcon name='plus' />
                    </IconButton>
                </Dialog.Trigger>
            </Tooltip>
            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                <Dialog.Title>Create Workspace</Dialog.Title>
                <Dialog.Description size='2'>Workspaces allow you to organize your channels and teams.</Dialog.Description>
                <Stack>
                    <AddWorkspaceForm onClose={onClose} />
                </Stack>
            </Dialog.Content>
        </Dialog.Root >
    }

    return <Drawer>
        <DrawerTrigger asChild>
            <IconButton
                color='gray'
                size='2'
                variant='ghost'>
                <FrappeIcon name='plus' />
            </IconButton>
        </DrawerTrigger>
        <DrawerContent>
            <div className='pb-16 overflow-y-scroll min-h-96'>
                <DrawerTitle>Create Workspace</DrawerTitle>
                <DrawerDescription>Workspaces allow you to organize your channels and teams.</DrawerDescription>
                <AddWorkspaceForm onClose={onClose} />
            </div>
        </DrawerContent>
    </Drawer>
}

export default AddWorkspaceSidebarButton
