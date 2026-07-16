import { RavenChannel } from "../../../../types/RavenChannelManagement/RavenChannel";
import FrappeIcon from '@/components/icons/FrappeIcon';
import { ComponentProps } from 'react';

export const getChannelIcon = (type: RavenChannel['type']) => {

    switch (type) {
        case 'Private': return 'lock'
        case 'Open': return 'globe'
        default: return 'hash'
    }
}

interface ChannelIconProps extends Omit<ComponentProps<typeof FrappeIcon>, 'name'> {
    type: RavenChannel['type']
}

export const ChannelIcon = ({ type, ...props }: ChannelIconProps) => {

    if (!type) return null

    return <FrappeIcon name={getChannelIcon(type)} {...props} />

}
