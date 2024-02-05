---
title: Pattern matching
layout: ../../layouts/DocLayout.astro
---

## Why: Every execution path should be handled

In addition to being syntactically disgraceful, TypeScript `switch/case` statements are not safe, as the TypeScript compiler will not let you know that you forgot to handle some execution paths.

This can cause errors, or even mistakes in your business logic.

## The solution: use the match function

You can use the `match` expression to return a certain value or execute a certain function when the input matches a certain value.

When using `match`, the compiler will force you to be exhaustive, reducing chances that your code has unpredictable behaviors, making it way safer.

Let's take a look at a simple example:

```ts
import { match } from "shulk";

type Pet = "cat" | "dog" | "hamster";
let pet: Pet = "cat";

const toy = match(pet).with({
  cat: "plastic mouse",
  dog: "bone",
  hamster: "wheel",
});
console.log(toy); // > "plastic mouse"
```

Note that you don't have to write a specific path for every value.

Every value must be handled one way or another, but you can use `_otherwise` to handle all the other cases in the same way.

```ts
function howManyDoIHave(pet: Pet) {
  return match(pet).with({
    cat: 3,
    _otherwise: 0,
  });
}

console.log(howManyDoIHave("cat")); // > 3
console.log(howManyDoIHave("dog")); // > 0
console.log(howManyDoIHave("hamster")); // > 0
```

Now, let's try to execute lambdas, by using the `case` method:

```ts
function makeSound(pet: Pet) {
  return match(pet)
    .returnType<void>()
    .case({
      cat: (val) => console.log(`${val}: meow`),
      dog: () => console.log(`${val}: bark`),
      hamster: () => console.log(`${val}: squeak`),
    });
}

console.log(makeSound("cat")); // > "cat: meow"
```

### Match numbers

When matching numbers, you can create a case for a specific number, but you can also create a case for numbers within a range!

```ts
// When provided an hour in format 24, the following function returns:
// - 'Night' when hour is between 0 and 4
// - 'Morning' when hour is between 5 and 11
// - 'Noon' when hour is 12
// - 'Afternoon' when hour is between 13 and 18
// - 'Evening' when hour is between 18 and 23
// - 'Not a valid hour' if hour didn't match any case
function hourToPeriod(hour: number) {
  return match(hour).with({
    "0..4": "Night",
    "5..11": "Morning",
    12: "Noon",
    "13..18": "Afternoon",
    "18..23": "Evening",
    _otherwise: "Not a valid hour",
  });
}
```

### Match unions

You can evaluate unions in a match expression, simply by using the tag of each variant. It will even infer the correct type when using the `case` method!

```ts
const TV = union<{
  On: { currentChannel: boolean };
  Off: {};
}>();
type TV = InferUnion<typeof TV>;

match(myTV).with({
  On: "TV is on!",
  Off: "TV is off!",
});

match(myTV).case({
  On: (tv: Television["On"]) => "TV is on!",
  Off: (tv: Television["Off"]) => "TV is off!",
});
```
