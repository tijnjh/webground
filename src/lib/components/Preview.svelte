<script lang='ts' module>
  import type { Code } from '../types'
  import { template } from '$lib/preview/template'
  import { localStore } from '$lib/utils'
  import { cn } from 'cnfn'
  import { Micro } from 'effect'

  let src = $state('/start.html')

  export function updatePreview(code: Code): Micro.Micro<{ didUpdate: boolean }, Error> {
    return Micro.gen(function* () {
      if (Object.values(code).every(v => v.trim() === '')) {
        src = '/start.html'
        return { didUpdate: false }
      }

      const url = Micro.try({
        try: () => {
          const blob = new Blob([template(code)], { type: 'text/html' })
          return URL.createObjectURL(blob)
        },
        catch: () => new Error('failed to create object url'),
      })

      src = yield* url

      yield* localStore('code', code)

      return { didUpdate: true }
    })
  }
</script>

<script lang='ts'>
  const props: { class?: string } = $props()
</script>

<iframe
  {src}
  title='preview'
  class={cn('bg-white border-0', props.class)}
  referrerpolicy='no-referrer'
  sandbox='allow-modals allow-downloads allow-scripts allow-forms'
>
</iframe>
