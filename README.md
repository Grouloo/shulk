# Monad-O

## Description

An attempt to bring some functionnal programming concepts and other useful things for execution safety to TypeScript.

## Get started

Coming soon...

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
import { match } from 'monad-o'

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

### State

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

Monad-O states allows you to make invalid states like this irrepresentable in the compiler, thus making your code safer.

#### Use states

Let's rewrite our Television model with Monad-O states:

```ts
import { state, Struct } from 'monad-o'

const Television = state<{
	On: Struct<{ currentChannel: number }>
	Off: Struct<{}>
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

The Result monad is a generic type (but really a State under the hood) that will and force you to handle errors by wrapping your return types .

Let's make a function that divides 2 number and can return an error:

```ts
import { Result, Ok, Err } from 'monad-o'

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
divide(2, 0).unwrap('Too bad!') // Uncaught Too bad!

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

## To do

-  State match typing
-  Custom methods for Struct
-  Macro?
-  Pipe operator?
