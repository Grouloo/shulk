# Wrappers

Shulk helps you to make your code safer by providing useful tools and structures, but you'll probably have to use unsafe third-party libraries or legacy code at some point.

To help you keep your code safe, Shulk provides wrappers that enable you to transform unsafe functions outputs into safe monads.

## resultify

The `resultify` wrapper takes an unsafe function and return its output in a `Result`.

You have probably used the `JSON.stringify()` method in your code before, but did you know that it will throw a `TypeError` if it encounters a `BigInt`? Probably not, and you won't learn it from its signature.

It is one of the rare functions of the JS standard library that actually throws an error instead of returning a `null` or an incorrect value. It is an improvement, but for us who want to build stable and reliable applications, it is not enough.

Let's make `JSON.stringify()` way safer by using Shulk's `resultify` wrapper:

```ts
import { resultify } from "shulk";

// With a single line of code, our application becomes much safer
const safeJsonStringify = resultify<TypeError, typeof JSON.stringify>(
  JSON.stringify,
);

// Now the one calling the function knows it can return a string,
// or a TypeError if it fails
const result: Result<TypeError, string> = safeJsonStringify({ foo: BigInt(1) });
```

## maybify

The `maybify` wrapper takes a function that can return `undefined`, `null`, or `NaN`, and returns its output in a `Maybe`monad, with the `None` state representing `undefined`, `null`, or `NaN`.

Let's reuse our `JSON.stringify` from before, but this time we will want a `Maybe` instead of a `Result`.

```ts
import { maybify } from "shulk";

// With a single line of code, our application becomes much safer
const safeJsonStringify = maybify(JSON.stringify);

// Now the one calling the function knows it can return:
// - a Some state containing a string,
// - a None state if there is nothing to return
const maybe: Maybe<string> = safeJsonStringify({ foo: BigInt(1) });
```
