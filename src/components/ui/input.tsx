import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-[42px] w-full min-w-0 rounded-[10px] border border-input bg-card px-3 text-foreground outline-none',
        'focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-soft)]',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
