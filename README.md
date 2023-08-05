# Shulk

## Description

An attempt to bring some functionnal programming concepts and other useful things for execution safety to TypeScript.

## Get started

```bash
npm i shulk
# OR
yarn add shulk
```

## How to use

### Pattern matching

#### Why: Every execution path should be handled

In addition to be syntactically disgraceful, TypeScript `switch/case` statements are not safe, as the TypeScript compiler will not let you know that you forgot to handle some execution paths.

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
	return match(pet).case({
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

Let's rewrite our Television model with Shulk states:

```ts
import { state } from 'shulk'

const Television = state<{
	On: { currentChannel: number }
	Off: {}
}>()
```

So, we just created a model with 2 states: the Television can be `On` and have a `currentChannel` property, or it can be `Off` and have no property.

Let's use our Television:

```ts
const onTV = Television.On({ currentChannel: 12 })
console.log(onTV.currentChannel) // > 12

const offTV = Television.Off({})
console.log(offTV.currentChannel) // > error TS2339: Property 'currentChannel' does not exist on type '{ _state: "Off"}'
```

#### Pattern matching using States

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

The Result monad is a generic type (but really a State under the hood) that will force you to handle errors by wrapping your return types .

Let's make a function that divides 2 number and can return an error:

```ts
import { Result, Ok, Err } from 'shulk'

function divide(dividend: number, divisor: number): Result<Error, number> {
	if (divisor == 0) {
		return Err(Error('Cannot divide by 0!'))
	}
	return Ok(dividend / divisor)
}

// We can then handle our Result in a few different ways

// unwrap() is unsafe as it will throw the Error state, but can be useful for prototyping
divide(2, 2).unwrap() // 1
divide(2, 0).unwrap() // Uncaught Error: Cannot divide by 0!

// expect() throws a custom message when it encounters an error state
// Like unwrap(), you shoudn't use it in a production context
divide(2, 2).expect('Too bad!') // 1
divide(2, 0).expect('Too bad!') // Uncaught Too bad!

// unwrapOr() will return the provided default value when encountering an error state
// It is safe to use in a production context, as the program cannot crash
divide(2, 2).unwrapOr('Not a number') // 1
divide(2, 0).unwrapOr('Not a number') // "Not a number"

// The val property contains the value returned by the function
// It is safe to use
divide(2, 2).val // 1
divide(2, 0).val // Error: Cannot divide by 0!
```

#### Result and pattern matching

Result is a State, which means you can handle it with `match`.

```ts
match(divide(2, 2)).case({
	Err: () => console.log('Could not compute result'),
	Ok: ({ val }) => console.log('Result is ', val),
})
```

### Optionnal value handling

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

		loading = match(res).case({
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

### Metaprogramming

#### Why: too much boilerplate

In our modern codebases, boilerplate is everywhere, as they are full of repetitive and useless code.

There is an answer to this pain, though : metaprogramming, or the ability for a program to treat code as data.

TypeScript doesn't have strong metaprogramming features like Rust or LisP do, but it gives us nice patterns and a powerful compiler which are enough to do some nice things.

#### Use definition macros

Using OOP, implementing the Repository pattern can be a pain, as it forces us to write a lot of boilerplate code.

With Shulk, you can define your own dynamic objects using the function `$defMacro`.

Let's implement the repository pattern using a definition macro:

```ts
import { $defMacro } from 'shulk'

// Our definition macro declaration
const $repository =
	<T>(table: string) =>
	(database: Adapter) =>
		$defMacro({
			props: { table, database },
			methods: {
				create: (self, obj: T): T => database.put(self.table, obj),
				read: (self, id: number): T => database.get(self.table, id),
				update: (self, id: number, obj: T): T =>
					database.put(self.table, id, obj),
				delete: (self, id: number): void => database.del(table, id),
			},
		})

type User = { id?: number; name: string; email: string }

// Let's create a repository for our User model
const UserRepository = $repository<User>('users')

// Now, we can instantiate our UserRepository, with an unspecified database adapter
const instance = UserRepository(myDatabase)

instance.create({ name: 'John Doe', email: 'john@ac.me' })

console.log(instance.read(1)) // > {id: 1, name: "John Doe", email: "john@ac.me"}
```

## To do

-  Custom methods for states (using macros?)
-  Macro?
