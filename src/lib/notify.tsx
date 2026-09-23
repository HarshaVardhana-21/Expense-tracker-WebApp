import { toast } from 'sonner'

interface NotifyAction {
  label: string
  onClick: () => void
}

/** Ink-pill toast; with an action (Undo) it stays up longer. */
export function notify(message: string, action?: NotifyAction) {
  toast.custom(
    (id) => (
      <div className="flex max-w-[calc(100vw-32px)] animate-rise items-center gap-3.5 rounded-xl bg-foreground py-2.5 pr-3 pl-4 text-sm text-background shadow-lift">
        <span>{message}</span>
        {action && (
          <button
            type="button"
            className="border-0 bg-transparent px-1.5 py-1 font-bold text-primary brightness-135"
            onClick={() => {
              toast.dismiss(id)
              action.onClick()
            }}
          >
            {action.label}
          </button>
        )}
      </div>
    ),
    { duration: action ? 6000 : 2600 },
  )
}
