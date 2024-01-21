<script lang="ts">
	import Container from '$lib/components/Container.svelte';
</script>

<title>Shulk, write beautiful code that won't crash.</title>

<Container>
	<h1>Shulk</h1>
	<h2>Write beautiful code that won't crash.</h2>

	<p>
		Shulk is an _opinionated_ TypeScript library that enhances your TypeScript code by providing a
		typesafe `match` expression, monads, and a better way to handle states and polymorphism.
	</p>

	<div class="centered">
		<a class="btn btn-primary" href="/docs/get-started">Get started</a>
		<a class="btn" href="https://github.com/Grouloo/shulk" target="_blank">See GitHub repo</a>
	</div>
</Container>

<style>
	h1,
	h2 {
		text-align: center;
	}

	.btn {
		color: black;
		font-size: larger;
		text-decoration: none;
		border-radius: 5px;
		padding-top: 10px;
		padding-bottom: 10px;
		padding-left: 20px;
		padding-right: 20px;
		box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
		transition-duration: 0.25s;
	}

	.centered {
		text-align: center;
	}

	.btn:hover {
		box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
	}

	.btn-primary {
		background-color: #ffeaa7;
		color: black;
	}

	.btn-primary:hover {
		background-color: #f9de87;
	}
</style>
