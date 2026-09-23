import { Toaster as Sonner, type ToasterProps } from 'sonner'

/**
 * Toasts render as custom content (see `@/lib/notify`), so the toaster itself is unstyled:
 * each toast slot is a full-width row that centres its pill.
 */
const Toaster = (props: ToasterProps) => (
  <Sonner
    position="bottom-center"
    offset={20}
    mobileOffset={20}
    gap={8}
    expand
    toastOptions={{ unstyled: true, className: 'flex w-full justify-center' }}
    {...props}
  />
)

export { Toaster }
