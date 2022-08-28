<script lang="ts">
	import '$lib/devtools';

	import type { LayoutData } from './$types';
	export let data: LayoutData;
	$: ({ theme_override } = data);

	import '../app.scss';
	import PopupScrolllock from '$lib/components/common/popup/popup_scrolllock.svelte';
	import { theme_index } from '$lib/stores/themestore';
	//export let theme_override: number | null;
	if (theme_override != null) {
		console.info('Found theme override', theme_override);
		theme_index.set(theme_override);
	}
</script>

<PopupScrolllock />
<slot />

<style lang="scss" global>
</style>
