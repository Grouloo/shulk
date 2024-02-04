---
layout: ../../layouts/DocLayout.astro
---

# Procedural programming

## Why: Organizing concurrent tasks is a pain

Sometimes you need to launch concurrent processes.
Javascript and Typescript have a way for you to that: launching a bunch of Promises, putting them in
an array, and finally executing `Promise.all()` on the array.

This is not bad, but this is not an exceptionnal way of doing this either, as code will quickly get messy.

## The solution: Use Procedure

Instead, you can use Shulk's Procedure; which allows you to create a pipeline of Result returning Promises, using a nice builder pattern.

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
