<script lang="ts">
	export let currentPage: string;
</script>

<nav>
	<div class="left">
		<a href="/" class={currentPage == '/' ? 'selected' : ''}>Home</a>
		<a href="/get-started" class={currentPage == '/get-started' ? 'selected' : ''}>Get started</a>
		<a href="/docs" class={currentPage == '/docs' ? 'selected' : ''}>Docs</a>
	</div>

	<div class="right">
		<a href="https://www.npmjs.com/package/shulk" target="_blank">NPM</a>
		<a href="https://github.com/Grouloo/shulk" target="_blank">Github</a>
	</div>
</nav>

<style>
	nav {
		display: grid;
		background-color: #2d3436;
		margin: 0;
		padding: 5px;
	}

	nav a {
		color: #b2bec3;
		text-decoration: none;
		margin-left: 15px;
	}

	nav a:hover,
	.selected {
		color: #dfe6e9;
	}

	.left {
		grid-column: 1;
		grid-row: 1;
	}

	.right {
		grid-column: 2;
		grid-row: 1;
		text-align: right;
	}
</style>
