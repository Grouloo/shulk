# Shulk

Write beautiful code that won't crash.

## Description

Shulk is an _opinionated_ TypeScript library that enhances your TypeScript code by providing a typesafe `match` expression, monads, and a better way to handle states and polymorphism.

## Get started

```bash
npm i shulk
# OR
yarn add shulk
# OR
bun add shulk
```

## How to use

### Pattern matching

#### Why: Every execution path should be handled

In addition to being syntactically disgraceful, TypeScript `switch/case` statements are not safe, as the TypeScript compiler will not let you know that you forgot to handle some execution paths.

This can cause errors, or even mistakes in your business logic.

#### Use match

You can use the `match` expression to return a certain value or execute a certain function when the input matches a certain value.

When using `match`, the compiler will force you to be exhaustive, reducing chances that your code has unpredictable behaviors, making it way safer.

Let's take a look at a simple example:

```ts
import { match } from 'shulk'

type Pet = 'cat' | 'dog' | 'hamster'
let pet: Pet = 'cat'

const toy = match(pet).with({
	cat: 'plastic mouse',
	dog: 'bone',
	hamster: 'wheel',
})
console.log(toy) // > "plastic mouse"
```

Note that you don't have to write a specific path for every value.

Every value must be handled one way or another, but you can use `_otherwise` to handle all the other cases in the same way.

```ts
function howManyDoIHave(pet: Pet) {
	return match(pet).with({
		cat: 3,
		_otherwise: 0,
	})
}

console.log(howManyDoIHave('cat')) // > 3
console.log(howManyDoIHave('dog')) // > 0
console.log(howManyDoIHave('hamster')) // > 0
```

Now, let's try to use functions:

```ts
function makeSound(pet: Pet) {
	return match(pet)
		.returnType<void>()
		.case({
			cat: (val) => console.log(`${val}: meow`),
			dog: () => console.log(`${val}: bark`),
			hamster: () => console.log(`${val}: squeak`),
		})
}

console.log(makeSound('cat')) // > "cat: meow"
```

### Polymorphism and state machines

#### Why: OOP has a problem

Let's try to model a Television using classic OOP. We want to know if the Television is on or off, and what channel it is displaying.

```ts
class Television {
	isOn: boolean
	currentChannel: number
}
```

There is a problem though: a Television that is currently off can't display anything, and so shouldn't have a `currentChannel` value.

We could just write a getter that throws or return null if `this.isOn == false`, but either way it's kind of awkward, as it would only be a verification at runtime.

Shulk states allows you to make invalid states like this irrepresentable in the compiler, thus making your code safer.

#### Use states

States are unions of types representing immutable data, hugely inspired by Rust's enums.

Let's rewrite our Television model with Shulk states:

```ts
import { state } from 'shulk'

const Television = state<{
	On: { currentChannel: number }
	Off: {}
}>()
type Television = State<typeof Television>
```

So, we just created a model with 2 states: the Television can be `On` and have a `currentChannel` property, or it can be `Off` and have no property.

The Television type we declared here can be transcribed to:

```ts
type Television = {
	On: { currentChannel: number; _state: 'On' }
	Off: { _state: 'Off' }
	any: { currentChannel: number; _state: 'On' } | { _state: 'Off' }
}
```

Let's use our Television:

```ts
const onTV: Television['On'] = Television.On({ currentChannel: 12 })
console.log(onTV.currentChannel) // > 12

const offTV: Television['Off'] = Television.Off({})
console.log(offTV.currentChannel) // > error TS2339: Property 'currentChannel' does not exist on type '{ _state: "Off"}'
```

#### You can 'match' states!

Guess what? You can evaluate states in a match expression:

```ts
match(myTV).with({
	On: 'TV is on!',
	Off: 'TV is off!',
})
```

### Error handling

#### Why: try/catch is unsafe

To handle errors (or exceptions), most languages have implemented the `try/catch` instruction, which is wacky in more ways than one.

First, it's syntactically strange. We are incitated to focus on the successful execution path, as if the `catch` instruction was 'just in case something bad might happen'.
We never write code like this in other situation. We never assume a value is equal to another, we first check that assumption in an `if` or a `match`. In the same logic, we should never assume that our code will always work.

Moreover, in some languages such as TypeScript, we can't even declare what kind of error we can throw, making the type safety in a `catch` block simply non-existent.

#### Use the Result monad

The Result monad is a generic type (but really a State under the hood) that will force you to handle errors by wrapping your return types.

```ts
type Result<ErrType, OkType>
```

Let's make a function that divides 2 number and can return an error:

```ts
import { Result, Ok, Err } from 'shulk'

function divide(dividend: number, divisor: number): Result<string, number> {
	if (divisor == 0) {
		return Err('Cannot divide by 0!')
	}
	return Ok(dividend / divisor)
}

// We can then handle our Result in a few different ways

// unwrap() is unsafe as it will throw the Error state, but can be useful for prototyping
divide(2, 2).unwrap() // 1
divide(2, 0).unwrap() // Uncaught Cannot divide by 0!

// expect() throws a custom message when it encounters an error state
// Like unwrap(), you shoudn't use it in a production context
divide(2, 2).expect('Too bad!') // 1
divide(2, 0).expect('Too bad!') // Uncaught Too bad!

// unwrapOr() will return the provided default value when encountering an error state
// It is safe to use in a production context, as the program cannot crash
divide(2, 2).unwrapOr('Not a number') // 1
divide(2, 0).unwrapOr('Not a number') // "Not a number"

// isOk() will return true if the Result has an Ok state
// When true, the compiler will infer that val has an OkType
divide(2, 2).isOk() // true
divide(2, 0).isOk() // false

// isErr() will return true if the Result has an Err state
// When true, the compiler will infer that val has an ErrType
divide(2, 2).isErr() // false
divide(2, 0).isErr() // true

// The val property contains the value returned by the function
// It is safe to use
divide(2, 2).val // 1
divide(2, 0).val // "Cannot divide by 0!"
```

#### Result and pattern matching

Result is a State, which means you can handle it with `match`.

```ts
match(divide(2, 2)).case({
	Err: () => console.log('Could not compute result'),
	Ok: ({ val }) => console.log('Result is ', val),
})
```

### Optional value handling

#### Why: the Billion Dollar Mistake

Of all languages, TypeScript is far from being the one with the worst `null` implementation.

You will never get a `NullPointerException`, but it won't always make your code safer, as you're not forced to handle it explicitely in some situations.

#### Use the Maybe monad

The Maybe monad is a generic type (and a State under the hood) which can has 2 states: Some (with a value attached), and None (with no value attached).

Let's take our `divide` function from the previous sanction, but this time we will return no value when confronted to a division by 0:

```ts
import { Maybe, Some, None } from 'shulk'

function divide(dividend: number, divisor: number): Maybe<number> {
	if (divisor == 0) {
		return None()
	}
	return Some(dividend / divisor)
}

// We can then handle our Result in a few different ways

// unwrap() is unsafe as it will throw if confronted to the None state, but can be useful for prototyping
divide(2, 2).unwrap() // 1
divide(2, 0).unwrap() // Uncaught Error: Maybe is None

// expect() throws a custom message when it encounters an error state
// Like unwrap(), you shoudn't use it in a production context
divide(2, 2).expect('Too bad!') // 1
divide(2, 0).expect('Too bad!') // Uncaught Too bad!

// unwrapOr() will return the provided default value when encountering a None state
// It is safe to use in a production context, as the program cannot crash
divide(2, 2).unwrapOr('Not a number') // 1
divide(2, 0).unwrapOr('Not a number') // "Not a number"
```

#### Maybe and pattern matching

Maybe is a State, which means you can handle it with `match`.

```ts
match(divide(2, 2)).case({
	None: () => console.log('Could not compute result'),
	Some: ({ val }) => console.log('Result is ', val),
})
```

### Handle loading

#### Use the Loading monad

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

#### Loading and pattern matching

Loading is a State, which means you can handle it with `match`.

```ts
match(loading).case({
	Pending: () => console.log('Now loading....'),
	Done: ({ val }) => console.log('Result is ', val),
	Failed: ({ val }) => {
		throw val
	},
})
```

### Wrappers

Shulk helps you make your code safer by providing useful tools and structures, but you'll probably have to use unsafe third-party libraries or legacy code at some point.

To help you keep your code safe, Shulk provides wrappers that enable you to transform unsafe functions outputs into safe monads.

#### resultify

The `resultify` wrapper takes an unsafe function and return its output in a `Result`.

You have probably used the `JSON.stringify()` method in your code before, but did you know that it will throw a `TypeError` if it encounters a `BigInt`? Probably not, and you won't learn it from its signature.

It is one of the rare functions of the JS standard library that actually throws an error instead of returning a `null` or an incorrect value. It is an improvement, but for us who want to build stable and reliable applications, it is not enough.

Let's make `JSON.stringify()` way safer by using Shulk's `resultify` wrapper:

```ts
import { resultify } from 'shulk'

// With a single line of code, our application becomes much safer
const safeJsonStringify = resultify<TypeError, typeof JSON.stringify>(
	JSON.stringify,
)

// Now the one calling the function knows it can return a string,
// or a TypeError if it fails
const result: Result<TypeError, string> = safeJsonStringify({ foo: BigInt(1) })
```

#### maybify

The `maybify` wrapper takes a function that can return `undefined`, `null`, or `NaN`, and returns its output in a `Maybe`monad, with the `None` state representing `undefined`, `null`, or `NaN`.

Let's reuse our `JSON.stringify` from before, but this time we will want a `Maybe` instead of a `Result`.

```ts
import { maybify } from 'shulk'

// With a single line of code, our application becomes much safer
const safeJsonStringify = maybify(JSON.stringify)

// Now the one calling the function knows it can return:
// - a Some state containing a string,
// - a None state if there is nothing to return
const maybe: Maybe<string> = safeJsonStringify({ foo: BigInt(1) })
```
