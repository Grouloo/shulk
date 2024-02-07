---
title: Concurrently
layout: ../../layouts/DocLayout.astro
---

## Why: Organizing concurrent tasks is a pain

Sometimes you need to launch concurrent processes.
Javascript and Typescript have a way for you to that: launching a bunch of Promises, putting them in
an array, and finally executing `Promise.all()` on the array.

This is not bad, but this is not an exceptionnal way of doing this either, as code will quickly get messy.

## The solution: The Concurrently helper

`Concurrently` helps you to launch multiple async Result-returning functions with a nice builder pattern and magic type inference.

If every function return an Ok state, `Concurrently` returns a wrapped tuple containing all values returned.

If one of the functions fails, `Concurrently` returns a wrapped error.

```ts
import { Concurrently, Ok } from "shulk";

const myTasksResults = Concurrently.run(async () => Ok("Hello!"))
  .and(async () => Ok(12))
  .and(async () => Ok(true))
  .done();

// myTasksResult will be infered as
// AsyncResult<never, [string, number, boolean]>
```
