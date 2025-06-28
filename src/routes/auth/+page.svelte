<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { createBrowserClient } from "@supabase/ssr";
  import {
    PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_URL,
  } from "$env/static/public";
  import { GithubIcon } from "@lucide/svelte";

  // Create Supabase client for OAuth
  const supabase = createBrowserClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  );

  async function signInWithGitHub() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Error signing in with GitHub:", error);
    }
  }
</script>

<svelte:head>
  <title>auth - webground</title>
</svelte:head>

<Header />

<div class="flex flex-col gap-8 mx-auto p-4 py-12 w-full max-w-4xl">
  <div class="gap-8 grid grid-cols-1 md:grid-cols-2">
    <hgroup>
      <h2
        class="mb-4 font-mono font-extrabold text-4xl text-balance tracking-tight scroll-m-20"
      >
        join webground
      </h2>
      <p class="text-muted-foreground">
        Sign in or create your account with GitHub
      </p>
    </hgroup>

    <div class="flex flex-col justify-center">
      <Button
        variant="default"
        size="lg"
        class="gap-3 w-full"
        onclick={signInWithGitHub}
      >
        <GithubIcon size={20} />
        Continue with GitHub
      </Button>
    </div>
  </div>
</div>
