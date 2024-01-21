<script lang="ts">
	import { page } from '$app/stores';
	import Navbar from '$lib/components/Navbar.svelte';
</script>

<Navbar currentPage={$page.url.pathname} />

<slot />

<style>
	:global(body) {
		/* this will apply to <body> */
		margin: 0;
		padding: 0;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}
</style>
