<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import { marked } from 'marked';
	import md from '$lib/docs/getting-started.md?raw';

	const text =
		marked.parse(md) +
		`<style>
            pre {
                 width: 75%;
                background-color: #f7f7f7;
            }
            code {	
		        color: black;
                font-family: monospace, monospace;
            }
        </style>`;
</script>

<Container>
	{@html text}
</Container>
