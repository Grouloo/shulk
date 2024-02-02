---
layout: ../../components/Segment.astro
---

# The Loading monad

## Use the Loading monad

The Loading monad has 3 states: Pending, Failed, Done.

Let's use the Loading monad in a Svelte JS application:

```svelte
<script lang="ts">
    import { Loading, Result, Pending, Failed, Done } from 'shulk'

    let loading: Loading<Error, string> = Pending()

	function OnMount() {
		const res: Result<Error, string> = await doSomething()

		loading = match(res)
			.returnType<Loading<Error, string>>()
			.case({
				Err: ({ val }) => Failed(val),
				Ok: ({ val }) => Done(val)
			})
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
  Done: ({ val }) => console.log("Result is ", val),
  Failed: ({ val }) => {
    throw val;
  },
});
```