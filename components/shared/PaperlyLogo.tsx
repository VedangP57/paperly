import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PAPERLY_BRAND_GUJ, PAPERLY_LOGO_SRC } from '@/lib/constants/brand'

type LogoSize = 'xs' | 'sm' | 'md' | 'lg'

const sizeMap: Record<LogoSize, { px: number; text: string }> = {
  xs: { px: 24, text: 'text-base' },
  sm: { px: 28, text: 'text-lg' },
  md: { px: 32, text: 'text-xl' },
  lg: { px: 40, text: 'text-2xl' },
}

interface PaperlyLogoProps {
  href?: string
  showLabel?: boolean
  size?: LogoSize
  label?: string
  className?: string
  labelClassName?: string
  linkClassName?: string
}

export function PaperlyLogo({
  href,
  showLabel = true,
  size = 'md',
  label = PAPERLY_BRAND_GUJ,
  className,
  labelClassName,
  linkClassName,
}: PaperlyLogoProps) {
  const { px, text } = sizeMap[size]

  const inner = (
    <span className={cn('inline-flex items-center gap-2.5 min-w-0', className)}>
      <Image
        src={PAPERLY_LOGO_SRC}
        alt={label}
        width={px}
        height={px}
        className="shrink-0 rounded-lg object-cover"
        priority={size === 'md' || size === 'lg'}
      />
      {showLabel ? (
        <span
          className={cn(
            'truncate font-bold tracking-tight text-[#18181b] dark:text-white',
            text,
            labelClassName
          )}
        >
          {label}
        </span>
      ) : null}
    </span>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          'no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#5e5cc5]/40 rounded-lg',
          linkClassName
        )}
      >
        {inner}
      </Link>
    )
  }

  return inner
}
