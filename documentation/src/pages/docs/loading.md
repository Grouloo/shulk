---
title: The Loading monad
layout: ../../layouts/DocLayout.astro
---

## Use the Loading monad

The Loading monad has 3 states: Pending, Failed, Done.

Let's use the Loading monad in a Svelte JS application:

```svelte
<script lang="ts">
    import { Loading, Result, Pending, Failed, Done } from 'shulk'

    let loading: Loading<Error, string> = Pending()

	async function onMount() {
		const res: Result<Error, string> = await doSomething()

		loading = res.toLoading()
	}
</script>

{#if loading._state == 'Loading'}
	<Loader />
{:else if loading._state == 'Done'}
	<p>{loading.val}</p>
{:else}
	<p color="red">{loading.val}</p>
{/if}
```

### Loading and pattern matching

Loading is a State, which means you can handle it with `match`.

```ts
match(loading).case({
  Pending: () => console.log("Now loading...."),
  Failed: ({ val: err }) => console.log("Got error:", err),
  Done: ({ val }) => console.log("Result is ", val),
});
```
