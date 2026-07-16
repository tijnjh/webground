import { Effect } from 'effect'
import { TerminalIcon } from 'lucide-react'
import { toast } from 'sonner'
import { usePreview } from './preview'
import { Button } from './ui/button'

export function RunButton() {
  const { updatePreview } = usePreview()

  return (
    <Button
      onClick={() => {
        Effect.runPromise(updatePreview()).catch((error) => {
          console.error(error)
          toast.error(JSON.stringify(error))
        })
      }}
    >
      <TerminalIcon size={16} />
      Run
    </Button>
  )
}
