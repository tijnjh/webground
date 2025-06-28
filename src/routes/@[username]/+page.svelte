<script lang="ts">
  import { enhance } from "$app/forms";
  import Header from "$lib/components/Header.svelte";
  import ProjectCard from "$lib/components/ProjectCard.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import { LogOutIcon } from "@lucide/svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>
    @{data.user.username} - webground
  </title>
  <meta
    name="description"
    content="Projects by @{data.user.username} on Webground"
  />
</svelte:head>

<Header />

<div class="mx-auto p-4 max-w-4xl">
  <div class="flex justify-between items-center">
    <h2 class="my-4 font-mono font-extrabold text-4xl text-balance tracking-tight scroll-m-20">
      @{data.user.username}
    </h2>
    <div class="flex space-x-3">
      {#if data.isOwnProfile}
        <form method="POST" action="/logout" use:enhance>
          <Button type="submit" variant="outline">
            <LogOutIcon />
            Logout
          </Button>
        </form>
      {/if}
    </div>
  </div>

  <Separator class="my-4" />

  <h2 class="mt-10 first:mt-0 mb-8 font-semibold text-3xl tracking-tight transition-colors scroll-m-20">
    {data.projects.length} Project{data.projects.length === 1 ? "" : "s"}
  </h2>

  <div
    class="gap-4 grid"
    style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))"
  >
    {#each data.projects as { title, shortId, createdAt }}
      <ProjectCard {title} {shortId} {createdAt} />
    {:else}
      <Card.Root class="py-12 text-center">
        <p class="opacity-50">
          No projects yet.
          {#if data.isOwnProfile}
            Start coding to save your first project!
          {/if}
        </p>
      </Card.Root>
    {/each}
  </div>
</div>
