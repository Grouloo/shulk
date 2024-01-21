<script lang="ts">
	import Container from '$lib/components/Container.svelte';

	export let data;

	const tableOfContent = {
		Shulk: [
			{
				title: 'Introduction',
				slug: 'introduction'
			},
			{
				title: 'Get started',
				slug: 'get-started'
			}
		],
		Basics: [
			{
				title: 'Tagged unions',
				slug: 'tagged-unions'
			},
			{
				title: 'Pattern matching',
				slug: 'pattern-matching'
			}
		],
		Monads: [
			{
				title: 'Result',
				slug: 'result'
			},
			{
				title: 'Maybe',
				slug: 'maybe'
			},
			{
				title: 'Loading',
				slug: 'loading'
			}
		]
	};

	$: text =
		data.doc +
		`<style>
            pre {
                 width: 100%;
                background-color: #f7f7f7;
            }
            code {	
		        color: black;
                font-family: monospace, monospace;
            }
        </style>`;
</script>

{#key text}
	<title>{data.title + ' - Shulk'}</title>
	<div class="grid">
		<div class="left">
			{#each Object.entries(tableOfContent) as [key, value]}
				<p>{key}</p>

				{#each value as link}
					<a href={'/docs/' + link.slug} class={link.title === data.title ? 'selected' : ''}
						>{link.title}</a
					>
				{/each}
			{/each}
		</div>

		<div class="right">
			<Container>
				{@html text}
			</Container>
		</div>
	</div>
{/key}

<style>
	.grid {
		display: grid;
	}

	.left {
		min-height: 100vh;
		max-height: 100%;
		width: 150px;
		grid-column: 1;
		grid-row: 1;
		background-color: #e5e5e5;
		padding-left: 5px;
	}

	.right {
		grid-column: 2;
		grid-row: 1;
		padding-left: 15px;
	}

	.left p {
		text-transform: uppercase;
		font-weight: bold;
		margin-bottom: 1px;
	}

	.left a {
		display: block;
		color: #868686;
		text-decoration: none;
	}

	.left a:hover,
	.selected {
		color: #303030;
	}
</style>
