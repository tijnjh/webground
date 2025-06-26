import type { Code, LangUnion } from "$lib/types";

interface Global {
    code: Code;
    currentTab: LangUnion;
}

export let µ: Global = $state({
    code: { html: "", css: "", js: "" },
    currentTab: "html",
});
