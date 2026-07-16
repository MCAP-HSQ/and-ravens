import { useBoolean } from '@/hooks/useBoolean'
import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes'
import { ViewFilesButton } from '../files/ViewFilesButton'
import AddChannelMembersModal from '../channel-member-details/add-members/AddChannelMembersModal'
import { useParams } from 'react-router-dom'
import GlobalSearch from '../GlobalSearch/GlobalSearch'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { useContext, useMemo } from 'react'
import useFetchChannelMembers from '@/hooks/fetchers/useFetchChannelMembers'
import { UserContext } from '@/utils/auth/UserProvider'
import ViewChannelDetailsModal from '../channels/ViewChannelDetailsModal'
import CreateMeetingDialog from '../integrations/meetings/CreateMeetingDialog'
import FrappeIcon from '@/components/icons/FrappeIcon'

type Props = {
    channelData: ChannelListItem,
}

const ChannelHeaderMenu = ({ channelData }: Props) => {

    const { channelID } = useParams()

    const { currentUser } = useContext(UserContext)
    const { channelMembers } = useFetchChannelMembers(channelData.name)

    const [isFileOpen, { on: onFileOpen }, onFileChange] = useBoolean(false)
    const [isAddMembersOpen, { on: onAddMembersOpen }, onAddMembersChange] = useBoolean(false)
    const [isGlobalSearchModalOpen, { on: onGlobalSearchModalOpen, off: onGlobalSearchModalClose }] = useBoolean(false)
    const [isChannelDetailsOpen, { on: onChannelDetailsOpen }, onChannelDetailsChange] = useBoolean(false)
    const [isMeetingModalOpen, { on: onMeetingModalOpen }, onMeetingModalChange] = useBoolean(false)

    const canAddMembers = useMemo(() => {
        if (channelData.type === 'Open') return false
        if (channelData.is_archived === 1) return false
        if (channelData.is_direct_message === 1) return false

        return channelMembers[currentUser] ? true : false

    }, [channelData, channelMembers, currentUser])

    return (
        <><DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <IconButton color='gray' variant='ghost' className='bg-transparent text-gray-10 hover:bg-gray-3 hover:text-gray-12'>
                    <FrappeIcon name='ellipsis-vertical' />
                </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className='min-w-48'>
                <DropdownMenu.Item onClick={onMeetingModalOpen}>
                    <Flex gap='2' align='center'>
                        <FrappeIcon name='video' />
                        Start a Meeting
                    </Flex>
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={onGlobalSearchModalOpen}>
                    <Flex gap='2' align='center'>
                        <FrappeIcon name='search' />
                        Search
                    </Flex>
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={onFileOpen}>
                    <Flex gap='2' align='center'>
                        <FrappeIcon name='file' />
                        View Files
                    </Flex>
                </DropdownMenu.Item>
                {/* <DropdownMenu.Item>
                    <Flex gap='2' align='center'>
                        <BiFolder size={ICON_SIZE} />
                        View Documents
                    </Flex>
                </DropdownMenu.Item> */}
                {channelData.is_direct_message === 0 && <>
                    <DropdownMenu.Separator />
                    {canAddMembers &&
                        <DropdownMenu.Item onClick={onAddMembersOpen}>
                            <Flex gap='2' align='center'>
                                <FrappeIcon name='user-plus' />
                                Add Members
                            </Flex>
                        </DropdownMenu.Item>
                    }

                    <DropdownMenu.Item onClick={onChannelDetailsOpen}>
                        <Flex gap='2' align='center'>
                            <FrappeIcon name='settings' />
                            Channel Settings
                        </Flex>
                    </DropdownMenu.Item>
                </>
                }
            </DropdownMenu.Content>
        </DropdownMenu.Root>
            <ViewFilesButton open={isFileOpen} setOpen={onFileChange} />
            <AddChannelMembersModal open={isAddMembersOpen} setOpen={onAddMembersChange} />
            <GlobalSearch isOpen={isGlobalSearchModalOpen}
                onClose={onGlobalSearchModalClose}
                tabIndex={0}
                input={''}
                inFilter={channelID}
            />

            <ViewChannelDetailsModal
                open={isChannelDetailsOpen}
                setOpen={onChannelDetailsChange}
                channelData={channelData}
            />

            <CreateMeetingDialog
                isOpen={isMeetingModalOpen}
                setOpen={onMeetingModalChange}
                channelData={channelData}
            />
        </>
    )
}

export default ChannelHeaderMenu
