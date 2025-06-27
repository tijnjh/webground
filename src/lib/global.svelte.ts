import type { LangUnion } from "$lib/types";

interface Global {
  currentTab: LangUnion;
}

export let µ: Global = $state({
  currentTab: "html",
});
