---
title: The Result monad for error handling
layout: ../../layouts/DocLayout.astro
---

## Why: try/catch is unsafe

To handle errors (or exceptions), most languages have implemented the `try/catch` instruction, which is wacky in more ways than one.

First, it's syntactically strange. We are incitated to focus on the successful execution path, as if the `catch` instruction was 'just in case something bad might happen'.
We never write code like this in other situation. We never assume a value is equal to another, we first check that assumption in an `if` or a `match`. In the same logic, we should never assume that our code will always work.

Moreover, in some languages such as TypeScript, we can't even declare what kind of error we can throw, making the type safety in a `catch` block simply non-existent.

## The solution: Use the Result monad

The Result monad is a generic type (but really an union under the hood) that will force you to handle errors by wrapping your return types.

## Type definition

```ts
type Result<ErrType, OkType> =
  | { val: ErrType; _state: "Err" }
  | { val: OkType; _state: "Ok" };
```

## Constructor

### Err

A Result representing a failure can be constructed with the `Err` function.

```ts
function Err<T>(val: T): Result<T, never>;
```

### Ok

A Result representing a success can be constructed with the `Ok` function.

```ts
function Ok<T>(val: T): Result<never, T>;
```

## Methods

The `Result` monad exposes several methods to unwrap its value.

You can see a usage of each method in the example section below.

### map

The `map` method allows you to map the success state of a `Result` to a new value.

```ts
function map<T>(fn: (val: OkType) => T): Result<ErrType, T>;
```

### flatMap

The `flatMap` method allows you to map the success state of a `Result` to a new `Result`.

```ts
function flatMap<E, O>(fn: (val: OkType) => Result<E, O>): Result<E, O>;
```

### flatMapAsync

The `flatMapAsync` method allows you to map the success state of a `Result` to a new `AsyncResult`.

```ts
function flatMapAsync<E, O>(
  fn: (val: OkType) => AsyncResult<E, O>,
): AsyncResult<E, O>;
```

### mapErr

The `mapErr` method allows you to map the failure state of a `Result` to a new value.

```ts
function mapErr<T>(fn: (val: ErrType) => T): Result<T, OkType>;
```

### filter

The `filter` method allows you to map a success state to a failure state if a condition isn't met.

```ts
function filter<E>(
  condition: (val: OkType) => boolean,
  otherwise: () => E,
): Result<E | ErrType, OkType>;
```

### filterType

The `filterType` method allows you to map a success state to a failure state if a condition isn't met, while narrowing the type of the success state.

```ts
function filter<E, O extends OkType>(
  condition: (val: OkType) => val is O,
  otherwise: () => E,
): Result<E, O>;
```

### toMaybe

The `toMaybe` method allows you to map a `Result` to a `Maybe` monad.

```ts
function toMaybe(): Maybe<OkType>;
```

### toLoading

The `toLoading` method allows you to map a `Result` to a `Loading` monad.

```ts
function toLoading(): Loading<ErrType, OkType>;
```

## Result and pattern matching

Result is an union, which means you can handle it with `match`.

```ts
import { Result, Ok, Err } from "shulk";

function divide(dividend: number, divisor: number): Result<string, number> {
  if (divisor == 0) {
    return Err("Cannot divide by 0!");
  } else {
    return Ok(dividend / divisor);
  }
}

match(divide(2, 2)).case({
  Err: () => console.log("Could not compute result"),
  Ok: ({ val }) => console.log("Result is ", val),
});
```

## Examples

Let's make a function that divides 2 number and can return an error:

```ts
import { Result, Ok, Err } from "shulk";

function divide(dividend: number, divisor: number): Result<string, number> {
  if (divisor == 0) {
    return Err("Cannot divide by 0!");
  } else {
    return Ok(dividend / divisor);
  }
}

// We can then handle our Result in a few different ways

// unwrap() is unsafe as it will throw the Error state, but can be useful for prototyping
divide(2, 2).unwrap(); // 1
divide(2, 0).unwrap(); // Uncaught Cannot divide by 0!

// expect() throws a custom message when it encounters an error state
// Like unwrap(), you shoudn't use it in a production context
divide(2, 2).expect("Too bad!"); // 1
divide(2, 0).expect("Too bad!"); // Uncaught Too bad!

// unwrapOr() will return the provided default value when encountering an error state
// It is safe to use in a production context, as the program cannot crash
divide(2, 2).unwrapOr("Not a number"); // 1
divide(2, 0).unwrapOr("Not a number"); // "Not a number"

// isOk() will return true if the Result has an Ok state
// When true, the compiler will infer that val has an OkType
divide(2, 2).isOk(); // true
divide(2, 0).isOk(); // false

// isErr() will return true if the Result has an Err state
// When true, the compiler will infer that val has an ErrType
divide(2, 2).isErr(); // false
divide(2, 0).isErr(); // true

// The val property contains the value returned by the function
// It is safe to use
divide(2, 2).val; // 1
divide(2, 0).val; // "Cannot divide by 0!"

// map() takes a function as an argument and return its value wrapped in an Ok state, or an Err state
divide(2, 2)
  .map((res) => res.toString())
  .unwrap(); // "1"
divide(2, 0)
  .map((res) => res.toString())
  .unwrap(); // Uncaught Cannot divide by 0!

// flatMap() takes a function that returns a Result, and return its value
divide(2, 2)
  .flatMap((res) => Ok(res.toString()))
  .unwrap(); // "1"
divide(2, 0)
  .flatMap((res) => Ok(res.toString()))
  .unwrap(); // Uncaught Cannot divide by 0!

// flatMapAsync() takes a function that returns a Result, and return its value in a Promise
divide(2, 2).flatMap((res) => Ok(res.toString())); // Promise
divide(2, 0).flatMap((res) => Ok(res.toString())); // Promise

// filter() evaluates a condition and returns a new Result
divide(2, 2).filter(
  (res) => res == 1,
  () => new Error("Result is not 1"),
); // 1
divide(4, 2).filter(
  (res) => res == 1,
  () => "Result is not 1",
); // "Result is not 1"

// filterType() evaluates a condition and returns a new Result wrapping the new type
divide(2, 2).filterType(
  (res): res is number => res == 1,
  () => new Error("Result is not 1"),
); // 1
divide(4, 2).filterType(
  (res): res is number => res == 1,
  () => "Result is not 1",
); // "Result is not 1"
```
