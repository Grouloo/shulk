<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import { marked } from 'marked';
	import md from '$lib/docs/getting-started.md?raw';

	const text = marked.parse(md);
</script>

<Container>
	{@html text}
</Container>
