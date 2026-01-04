import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

export const ButtonLink = (
	{ className, children, href, isExternal, onClick, size, variant }:
	{
		className?: string
		children: any
		href: string
		isExternal?: boolean
		onClick?: () => void
		size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg' | null
		variant?: 'default' | 'secondary' | 'blue' | 'purple' | 'outline' | 'ghost' | 'link' | null
	}
) => (
	<Link tabIndex={-1} href={href} target={isExternal ? '_blank' : '_self'}>
		<Button
			size={size}
			variant={variant}
			onClick={onClick}
			className={cn(className, `cursor-pointer`)}
		>
			{children}
		</Button>
	</Link>
)