# Optional value handling

## Why: the Billion Dollar Mistake

Of all languages, TypeScript is far from being the one with the worst `null` implementation, even if it still is evaluated as an "object".

You will never get a `NullPointerException`, but it won't always make your code safer, as you're not forced to handle it explicitely in some situations.

## The solution: Use the Maybe monad

The Maybe monad is a generic type (and an union under the hood) which can has 2 states: Some (with a value attached), and None (with no value attached).

Let's take our `divide` function from the previous sanction, but this time we will return no value when confronted to a division by 0:

```ts
import { Maybe, Some, None } from 'shulk';

function divide(dividend: number, divisor: number): Maybe<number> {
	if (divisor == 0) {
		return None();
	} else {
		return Some(dividend / divisor);
	}
}

// We can then handle our Result in a few different ways

// unwrap() is unsafe as it will throw if confronted to the None state, but can be useful for prototyping
divide(2, 2).unwrap(); // 1
divide(2, 0).unwrap(); // Uncaught Error: Maybe is None

// expect() throws a custom message when it encounters an error state
// Like unwrap(), you shoudn't use it in a production context
divide(2, 2).expect('Too bad!'); // 1
divide(2, 0).expect('Too bad!'); // Uncaught Too bad!

// unwrapOr() will return the provided default value when encountering a None state
// It is safe to use in a production context, as the program cannot crash
divide(2, 2).unwrapOr('Not a number'); // 1
divide(2, 0).unwrapOr('Not a number'); // "Not a number"

// map() takes a function as an argument and return its value wrapped in a Some state, or a None state
divide(2, 2)
	.map((res) => res.toString())
	.unwrap(); // "1"
divide(2, 0)
	.map((res) => res.toString())
	.unwrap(); // Uncaught Error: Maybe is None

// flatMap() takes a function that returns a Maybe as an argument, and return its value
divide(2, 2)
	.flatMap((res) => Some(res.toString()))
	.unwrap(); // "1"
divide(2, 0)
	.flatMap((res) => Some(res.toString()))
	.unwrap(); // Uncaught Error: Maybe is None

// toResult() maps the Maybe to a Result monad
divide(2, 2).toResult(() => 'Cannot divide by 0'); // Result<string, number>
```

### Maybe and pattern matching

Maybe is a State, which means you can handle it with `match`.

```ts
match(divide(2, 2)).case({
	None: () => console.log('Could not compute result'),
	Some: ({ val }) => console.log('Result is ', val)
});
```
