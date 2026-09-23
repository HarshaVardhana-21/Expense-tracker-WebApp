import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center gap-2 whitespace-nowrap border border-transparent font-semibold transition-colors disabled:opacity-35 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        outline: 'bg-transparent border-input text-foreground hover:border-ink-2',
        /** Bordered square on a card surface — month stepper, close. */
        subtle: 'bg-card border-input text-ink-2 enabled:hover:border-ink-2 enabled:hover:text-foreground',
        destructive: 'bg-transparent text-destructive hover:underline',
      },
      size: {
        default: 'h-[38px] rounded-[10px] px-4',
        sm: 'h-8 rounded-[10px] px-3 text-[13px]',
        xs: 'h-[30px] rounded-[10px] px-3 text-[13px]',
        icon: 'grid size-9 place-items-center rounded-[10px] p-0',
        link: 'h-[38px] rounded-[10px] px-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
