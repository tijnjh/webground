import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from './ui/button'

export function AppearanceToggle() {
  const { theme, setTheme } = useTheme()

  const toggle = () =>
    theme === 'dark'
      ? setTheme('light')
      : setTheme('dark')

  return (
    <Button
      onClick={toggle}
      variant="outline"
      size="icon"
    >
      <SunIcon
        className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
      />
      <MoonIcon
        className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
