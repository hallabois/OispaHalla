<script context="module">
	export async function load({ session }) {
		const theme = session.theme;
		return { props: {
			theme_override: theme
		} };
	}
</script>
<script lang="ts">
	import { browser } from "$app/env";
	import "../app.scss";
    import PopupScrolllock from "$lib/components/common/popup/popup_scrolllock.svelte";
	import { theme_index } from "$lib/themestore";
    export let theme_override: number | null;
    if(!browser && theme_override != null) {
    	theme_index.set(theme_override);
    }
</script>

<PopupScrolllock />
<slot />

<style lang="scss" global>
	
</style>