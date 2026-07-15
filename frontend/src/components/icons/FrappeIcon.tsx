import { ComponentPropsWithoutRef } from 'react'
import clsx from 'clsx'

type FrappeIconProps = Omit<ComponentPropsWithoutRef<'svg'>, 'children'> & {
    name: string
    size?: number | string
}

/** Uses the icon sprite shipped by the active Frappe installation. */
const FrappeIcon = ({ name, size = 16, className, ...props }: FrappeIconProps) => (
    <svg
        aria-hidden={props['aria-label'] ? undefined : true}
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={clsx('inline-block shrink-0', className)}
        {...props}
    >
        <use href={`/assets/frappe/icons/lucide/icons.svg#icon-${name}`} />
    </svg>
)

export default FrappeIcon
