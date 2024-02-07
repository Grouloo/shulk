---
title: Procedure
layout: ../../layouts/DocLayout.astro
---

## Pipelining is nice

Using Shulk's `Result` and `Maybe` monads, you can write your code using nice pipelines, where the output of a function is the input of the next one.

A problem you will encounter is that after an async call, you'll have to await the result and continue your pipeline after that.

## The solution: Use Procedure

With Shulk's Procedure, you can create a pipeline of Result returning Promises, using a nice builder pattern.

You don't have to await anything, everything is executed when you call the `end()` method.

```ts
const myProcedure = await Procedure.start()
  .sequence(async () => Ok("Hello, world!")) // When a routine is executed, its response is passed down to the next one
  .sequence(async (msg) => Ok(msg.length)) // Here, msg's value is "Hello, world!"
  .parallelize<never, [string, number]>(
    async (length) => Ok(length.toString()),
    async (length) => Ok(length + 1),
  ) // Parallelized routines are executed concurrently. When a single one fails, the error is returned, otherwise all the coroutines responses are returned in an array.
  .end(); // The procedure will be executed and return type Result<never, [string, number]>
```

Sequences are executed one after another and with the `parallelize` method you can execute multiple async functions concurrently.
