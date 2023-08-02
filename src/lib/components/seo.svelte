<script lang="ts">
	import SvelteSeo from "svelte-seo";
	export let title = "Oispa Halla";
	export let description = "Yhdistä opettajat ja saavuta Halla!";
	export let url = "https://oispahalla.com";
	export let keywords = "Oispahalla, halla, ksyk, 2048, Lauri Halla, hallabois, oispa pelit";
	export let themeColor = "#000000";
	export let site_name = "OispaHalla.com";
	export let image = {
		url: "https://oispahalla.com/img/raksahalla_512.webp",
		alt: "a man in a suit wearing a hard hat and welders' goggles",
		width: 512,
		height: 512
	};
</script>

<SvelteSeo
	{title}
	{description}
	canonical={url}
	{keywords}
	{themeColor}
	openGraph={{
		site_name: site_name,
		type: "website",
		title: title,
		description: description,
		url: url,
		image: image.url,
		images: [image]
	}}
	twitter={{
		title: title,
		card: "app",
		image: image.url,
		imageAlt: image.alt
	}}
/>
