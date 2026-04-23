import { browser } from '$app/environment';
import { MediaQuery } from 'svelte/reactivity';

export function useIsMobile() {
	return new MediaQuery('max-width: 768px');
}

export function useIsShared() {
	if (!browser) return false;

	const params = new URL(location.href).searchParams;

	function check() {
		const h = params.get('h');
		const c = params.get('c');
		const j = params.get('j');

		return Boolean(h || c || j);
	}

	const isShared = $state(check());

	return isShared;
}
