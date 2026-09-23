import { MonitorIcon, MoonIcon, SunIcon, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { THEMES, type Theme } from '@/theme/theme'
import { useTheme } from '@/theme/theme-provider'

const OPTIONS: Record<Theme, { label: string; Icon: LucideIcon }> = {
  light: { label: 'Light', Icon: SunIcon },
  dark: { label: 'Dark', Icon: MoonIcon },
  system: { label: 'System', Icon: MonitorIcon },
}

export function ThemeMenu() {
  const { theme, setTheme } = useTheme()
  const Current = OPTIONS[theme].Icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="subtle" size="icon" aria-label={`Theme: ${OPTIONS[theme].label}`}>
          <Current className="size-4" strokeWidth={1.8} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[9.5rem]">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
          {THEMES.map((t) => {
            const { label, Icon } = OPTIONS[t]
            return (
              <DropdownMenuRadioItem key={t} value={t}>
                <Icon className="size-4 text-ink-2" strokeWidth={1.8} aria-hidden="true" />
                {label}
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
