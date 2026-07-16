import React, { forwardRef, ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Flex, FlexProps, IconButton, Text, TextProps } from '@radix-ui/themes';
import { IconButtonProps } from '@radix-ui/themes/dist/cjs/components/icon-button';
import { BadgeProps } from '@radix-ui/themes/dist/cjs/components/badge';
import { clsx } from 'clsx';
import { __ } from '@/utils/translations';
import FrappeIcon from '@/components/icons/FrappeIcon';

type SidebarGroupProps = FlexProps & {
    children: ReactNode;
}

export const SidebarGroup = ({ children, ...props }: SidebarGroupProps) => {

    return (
        <Flex direction='column' gap='2' {...props}>
            {children}
        </Flex>
    )
}

type SidebarGroupItemProps = FlexProps & {
    children: ReactNode
}
export const SidebarGroupItem = ({ children, ...props }: SidebarGroupItemProps) => {

    return (
        <Flex align='center' {...props}>
            {children}
        </Flex>
    )
}

type SidebarGroupLabelProps = TextProps & {
    children: ReactNode
}

export const SidebarGroupLabel = ({ children, ...props }: SidebarGroupLabelProps) => {
    return (
        <Text size='1' weight='medium' {...props} className={clsx('uppercase tracking-[0.055em] text-gray-10', props.className)}>
            {children}
        </Text>
    )
}

type SidebarGroupListProps = FlexProps & {
    children: ReactNode
}
export const SidebarGroupList = ({ children, ...props }: SidebarGroupListProps) => {

    return (
        <Flex direction='column' {...props} className={clsx('gap-0.5 overflow-hidden transition-all duration-150 ease-out', props.className)}>
            {children}
        </Flex>
    )
}

type SidebarItemProps = FlexProps & {
    to: string;
    children: React.ReactNode,
    end?: boolean,
    active?: boolean,
    activeStyles?: Record<string, string>
}

export const SidebarItem = forwardRef<HTMLAnchorElement, SidebarItemProps>(({ to, children, end, active = false, activeStyles, className, ...props }, ref) => {

    const activeClass = 'bg-gray-4 text-gray-12'

    return (
        <NavLink
            to={to}
            end={end}
            className='no-underline'
            ref={ref}
        >
            {({ isActive }) => {
                return (
                    <Flex
                        gap='2'
                        align='center'
                        className={clsx('min-h-8 cursor-pointer select-none rounded-[6px] px-2 text-gray-11 no-underline transition-colors hover:bg-gray-3 hover:text-gray-12 active:bg-gray-4', (isActive || active) ? activeClass : '', className)}
                        {...props}>
                        {children}
                    </Flex>
                )
            }}
        </NavLink>
    )
})

type SidebarIconProps = FlexProps & {
    subtle?: boolean,
    children: React.ReactNode
}
export const SidebarIcon = ({ subtle, children, ...props }: SidebarIconProps) => {
    return (
        <Flex align='center' justify='center' className='shrink-0 text-gray-10' {...props}>
            {children}
        </Flex>
    )
}



type SidebarButtonItemProps = FlexProps & {
    children: React.ReactNode,
    subtle?: boolean,
    onClick?: () => void,
    isLoading?: boolean
    active?: boolean
}

export const SidebarButtonItem = ({ children, subtle, onClick, isLoading, active, className, ...props }: SidebarButtonItemProps) => {

    const cursor = isLoading ? "cursor-progress" : "cursor-pointer"

    return (
        <Flex
            gap='2'
            align='center'
            className={clsx('min-h-8 select-none rounded-[6px] px-2 text-gray-11 transition-colors hover:bg-gray-3 hover:text-gray-12', active && 'bg-gray-4 text-gray-12', cursor, className)}
            onClick={onClick}
            {...props}
        >
            {children}
        </Flex>
    )
}

interface SidebarViewMoreButtonProps extends IconButtonProps {
    onClick: () => void,
    expanded: boolean
}

export const SidebarViewMoreButton = ({ expanded, onClick, ...props }: SidebarViewMoreButtonProps) => {

    return (
        <IconButton
            aria-label={expanded ? __("Collapse") : __("Expand")}
            title={expanded ? __("Collapse") : __("Expand")}
            variant='ghost'
            size='1'
            radius='medium'
            onClick={onClick}
            {...props}
            className={clsx('cursor-pointer bg-transparent text-gray-9 transition-colors hover:bg-gray-3 hover:text-gray-12 group-hover:text-gray-11', props.className)}
        >
            <FrappeIcon name={expanded ? 'chevron-down' : 'chevron-right'} size={14} />
        </IconButton>
    )
}

export const SidebarBadge = ({ children, className, ...props }: BadgeProps) => {

    return (
        <div className={clsx('flex h-[18px] min-w-[18px] items-center justify-center whitespace-nowrap rounded-full bg-gray-5 px-1.5 text-[11px] font-medium leading-none text-gray-11', className)}>
            {children}
        </div>
    )
}
