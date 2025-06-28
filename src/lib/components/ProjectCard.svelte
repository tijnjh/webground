<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { Trash2Icon } from "@lucide/svelte";
  import dayjs from "dayjs";
  import Button from "./ui/button/button.svelte";
  import Separator from "./ui/separator/separator.svelte";

  let {
    title,
    shortId,
    createdAt,
    deleteAction,
  }: {
    title: string;
    shortId: string;
    createdAt: Date | null;
    deleteAction?: Function;
  } = $props();
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>{title}</Card.Title>
    {#if createdAt}
      <span class="text-sm">
        {dayjs(createdAt).format("D MMMM YYYY")}
      </span>
    {/if}
  </Card.Header>
  <Card.Content>
    <div class="flex justify-between">
      <Button href="/s/{shortId}">View</Button>
      {#if deleteAction}
        <Popover.Root>
          <Popover.Trigger>
            <Button size="icon" variant="destructive">
              <span class="sr-only">Delete project</span>
              <Trash2Icon />
            </Button>
          </Popover.Trigger>
          <Popover.Content align="start">
            Are you sure you want to delete this project?

            <Separator class="my-4" />

            <Button variant="destructive" class="w-full">
              Delete project
            </Button>
          </Popover.Content>
        </Popover.Root>
      {/if}
    </div>
  </Card.Content>
</Card.Root>
