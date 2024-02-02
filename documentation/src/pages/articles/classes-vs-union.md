---
layout: ../../components/Segment.astro
---

# Classes vs unions

Nowadays, Object Oriented Programming means using classes with a lot of setters and getters and mutations and calling it a day.

This is a sham, true OOP is not like that.

True OOP is about encapsulation and interactions, and behavior.

You don't need to choose between object oriented programming and functionnal programming because it is a false dichotomy. You can do both, and you should do both.

Classes are sometimes useful, but let's face it, they often allow terrible code to be written.

OOP is easy to fail because writing classes is easy to fail. So instead, let's use a more suited tool for the job. It is as simple as that.

Be a pragmatic developer, not a dogmatic one.

You can modelize your domain without classes, by using Shulk's tagged unions: allowing you to deal with polymorphic and immutable data structures.

Let's create a Mario state machine and implement how he changes when he collides with a monster!

## With Shulk, using a tagged union

Quite simple, isn't it? It's just a tagged union and a function!

```ts
import { union, type InferUnion } from "shulk";

const Mario = union<{
  Small: { coins: number };
  Super: { coins: number };
  Fire: { coins: number };
  Superstar: { coins: number; timeLeft: number };
  Dead: {};
}>();
type Mario = InferUnion<typeof Mario>;

function collideWithMonster(mario: Mario["any"]): Mario["any"] {
  const updatedMario = match(mario)
    .returnType<Mario["any"]>()
    .case({
      Small: () => Mario.Dead(),
      Super: (mario) => Mario.Small({ coins: mario.coins }),
      Fire: (mario) => Mario.Super({ coins: mario.coins }),
      Superstar: (mario) => mario,
      Dead: (mario) => mario,
    });

  return updatedMario;
}
```

## Without Shulk, using OOP

Using OOP and the [State design pattern](https://refactoring.guru/design-patterns/state).

Same result, but much longer and much more implicit

```ts
interface MarioState {
  coins: number | null;
  collideWithMonster(): void;
}

class Mario implements MarioState {
  constructor(private state: MarioState) {}

  get coins(): number | null {
    return this.state.coins;
  }

  changeState(state: MarioState) {
    this.state = state;
  }

  collideWithMonster() {
    this.state.collideWithMonster();
  }
}

class Small implements MarioState {
  constructor(
    private mario: Mario,
    private _coins: number,
  ) {}

  get coins() {
    return this._coins;
  }

  collideWithMonster() {
    this.mario.changeState(new Dead());
  }
}

class Super implements MarioState {
  constructor(
    private mario: Mario,
    private _coins: number,
  ) {}

  get coins() {
    return this._coins;
  }

  collideWithMonster() {
    this.mario.changeState(new Small(this.mario, this.coins));
  }
}

class Fire implements MarioState {
  constructor(
    private mario: Mario,
    private _coins: number,
  ) {}

  get coins() {
    return this._coins;
  }

  collideWithMonster() {
    return this.mario.changeState(new Super(this.mario, this.coins));
  }
}

class Superstar implements MarioState {
  private timeLeft: number;

  constructor(private _coins: number) {
    this.timeLeft = 20;
  }

  get coins() {
    return this._coins;
  }

  collideWithMonster() {}
}

class Dead implements MarioState {
  get coins() {
    return null;
  }

  collideWithMonster() {}
}
```
