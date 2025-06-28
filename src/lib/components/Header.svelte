<script lang="ts">
  import AppearanceToggle from "./AppearanceToggle.svelte";
  import Button from "./ui/button/button.svelte";
</script>

<header class="border-b">
  <div class="top-0 sticky flex justify-between items-center mx-auto p-4 w-full max-w-4xl">
    <div class="flex items-center gap-2">
      <h1 class="font-mono font-medium text-lg">webground</h1>
    </div>

    <div class="flex gap-2">
      <AppearanceToggle />
      <Button href="/">Open editor</Button>
    </div>
  </div>
</header>
