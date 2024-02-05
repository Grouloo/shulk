---
title: Tagged unions
layout: ../../layouts/DocLayout.astro
---

## Why: OOP has a problem

Let's try to model a Television using classic OOP. We want to know if the Television is on or off, and what channel it is displaying.

```ts
class Television {
  isOn: boolean;
  currentChannel: number;
}
```

There is a problem though: a Television that is currently off can't display anything, and so shouldn't have a `currentChannel` value.

We could just write a getter that throws or return null if `this.isOn == false`, but either way it's kind of awkward, as it would only be a verification at runtime.

Shulk unions allows you to make invalid states like this irrepresentable in the compiler, thus making your code safer.

## The solution: Use unions

Unions are tagged unions of types representing immutable data, hugely inspired by Rust's enums.

Let's rewrite our Television model with Shulk unions:

```ts
import { union, InferUnion } from "shulk";

const Television = union<{
  On: { currentChannel: number };
  Off: {};
}>();
type Television = InferUnion<typeof Television>;
```

So, we just created a model with 2 states: the Television can be `On` and have a `currentChannel` property, or it can be `Off` and have no property.

The Television type we declared here can be transcribed to:

```ts
type Television = {
  On: { currentChannel: number; _state: "On" };
  Off: { _state: "Off" };
  any: { currentChannel: number; _state: "On" } | { _state: "Off" };
};
```

Let's use our Television:

```ts
const onTV: Television["On"] = Television.On({ currentChannel: 12 });
console.log(onTV.currentChannel); // > 12

const offTV: Television["Off"] = Television.Off({});
console.log(offTV.currentChannel); // > error TS2339: Property 'currentChannel' does not exist on type '{ _state: "Off"}'
```
