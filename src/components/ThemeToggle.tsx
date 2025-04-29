
import { Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  return (
    <Button variant="outline" size="icon" className="w-full justify-between">
      <Moon className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Tema escuro</span>
    </Button>
  )
}
