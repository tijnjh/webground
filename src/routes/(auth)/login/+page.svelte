<script lang="ts">
  import { enhance } from "$app/forms";
  import Header from "$lib/components/Header.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
  <title>signup - webground</title>
</svelte:head>

<Header />

<div class="flex flex-col gap-8 mx-auto p-4 py-12 w-full max-w-4xl">
  <div class="gap-8 grid grid-cols-1 md:grid-cols-2">
    <hgroup>
      <h2
        class="mb-4 font-mono font-extrabold text-4xl text-balance tracking-tight scroll-m-20"
      >
        log in
      </h2>
      <p>
        Or
        <a
          class="font-medium text-primary underline underline-offset-4"
          href="/signup"
        >
          create a new account
        </a>
      </p>
    </hgroup>

    <form method="POST" use:enhance class="flex flex-col gap-2">
      <label for="usernameOrEmail" class="sr-only">Username or Email</label>
      <Input
        id="usernameOrEmail"
        name="usernameOrEmail"
        type="text"
        required
        placeholder="Username or Email"
      />
      <label for="password" class="sr-only">Password</label>
      <Input
        id="password"
        name="password"
        type="password"
        required
        placeholder="Password"
      />

      {#if form?.error}
        <div class="text-red-600 text-sm">{form.error}</div>
      {/if}

      <Separator class="my-2" />

      <Button type="submit">Sign in</Button>
    </form>
  </div>
</div>
