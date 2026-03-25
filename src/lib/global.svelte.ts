import type { LangUnion } from '$lib/types';

interface Global {
	currentTab: LangUnion;
}

export const µ: Global = $state({
	currentTab: 'html'
});
