---
layout: ../../layouts/ExampleLayout.astro
---

# Domain modeling

You can use Shulk to modelize your domain as accurately as possible, all while enabling the TypeScript compiler to understand what you are trying to achieve, and get it to help you implementing your domain logic correctly.

In this example we will build a simple blog.

## Step 0 - Dependencies

For this blog project, we will need a database, but this example is not about databases, so we will simply mock the dependency with the following type:

```ts
import { AsyncResult } from "shulk";

type DB = {
  put: <T>(
    collection: string,
    id: string,
    content: unknown,
  ) => AsyncResult<BackendError, {}>;

  read: <T>(collection: string, id: string) => AsyncResult<BackendError, T>;
  query: <T>(
    collection: string,
    q: Record<string, unknown>,
  ) => AsyncResult<BackendError, T[]>;
};
```

## Step 1 - Specs

For our blog, we want to implement the following features:

- The blog will have registered authors, whom have names.
- Only registered authors will be able to write articles
- When an article is created, it is first set as a draft
- A draft article can be modified and only authors can see it until it is published
- When an article is ready, a registered author can publish it
- Everyone can see published articles
- Readers will be able to leave comments under published articles
- Authors will be able to delete inappropriate comments

## Step 2 - Entity modeling

We can modelize our entities from the specs using TypeScript types and Shulk's unions:

### Author

An author is a pretty straightforward data structure:

```ts
export type AuthorSlug = string;

export type Author = {
  slug: AuthorSlug;
  name: string;
  password: string;
};
```

### Article

An article is somewhat a littble bit more complicated.

The specs tell us that it can be in 2 states:

- **Draft**: it can be modified by an author and cannot be seen by readers
- **Published**: it cannot be modified anymore and everyone can see it

Without Shulk, we surely would have to rely on a class with some optional properties.

Luckily, with Shulk's unions we can modelize an article of our blog much more accurately:

```ts
import { union, InferUnion } from "shulk";

export const Article = union<{
  Draft: {
    slug: name;
    title: string;
    content: string;
  };
  Published: {
    slug: name;
    title: string;
    content: string;
    publishedBy: AuthorSlug;
    publishedAt: Date;
  };
}>();
export type ArticleTag = InferUnion<typeof Article>;
export type Article = ArticleTag["any"];
```

### Comment

Much like an article, a comment can be in 2 states:

- **Published**: everyone can see it
- **Removed**: it cannot be seen anymore

We can model it using an union like before:

```ts
import { union, InferUnion } from "shulk";

export const Comment = union<{
  Published: {
    commentId: string;
    articleSlug: string;
    commenterName: string;
    content: string;
    publishedAt: Date;
  };
  Removed: {
    commentId: string;
    articleSlug: string;
    commenterName: string;
    content: string;
    publishedAt: Date;
    removedAt: Date;
    removedBy: AuthorSlug;
  };
}>();
export type CommentTag = InferUnion<typeof Comment>;
export type Comment = CommentTag["any"];
```

## Step 3 - Implementing behaviors

Now that we have our entities, we can start to implement behaviors using TypeScript.

Let's see how we will handle errors, validation logic, mutations, and transitions between states.

## Author actions

For the author entity, we'll need a `login` function.

We want to implement the following steps:

- We will take a classic login form as input
- Check if the username/password pair matches an entry in our DB
- Return an error when nothing matches
- Return an access token when the pair matches an entry

```ts
type LoginForm = {
  name: string;
  password: string;
};

type LoginDependencies = {
  db: DB;
  generateToken: (author: Author) => string;
};

class AuthorNotFound extends Error {}

export async function login(
  input: LoginForm,
  dep: LoginDependencies,
): AsyncResult<BackendError | AuthorNotFound, string> {
  const findAuthorResult = await dep.db.query<Author>("authors", {
    name: input.name,
    password: input.password,
  });

  const generateTokenResult = findAuthorResult
    .filter(
      (authors) => authors.length == 1,
      () => new AuthorNotFound("Author not found"),
    )
    .map((authors) => authors[0])
    .map((loggedAuthor) => dep.generateToken(author.slug));

  return generateTokenResult;
}
```

## Article actions

For the articles, we will need several functions.

First, we'll want a `create` function that will handle articles creation, implementing the following steps:

- Take a creation form as input
- Create a slug from the article title
- Create an article in 'Draft' state from the input and the slug
- Persist the draft in the database
- Return the slug

```ts
type ArticleCreationForm = {
  title: string;
  content: string;
};

export async function create(
  input: ArticleCreationForm,
  db: DB,
): AsyncResult<BackendError, string> {
  const slug = input.title.toLowerCase().replace(" ", "-");

  const article = Article.Draft({
    slug: slug,
    title: input.title,
    content: input.content,
  });

  const createArticleResult = await db.put("articles", slug, article);

  return createArticleResult.map((article) => article.slug);
}
```

Next, we'll want to be able to edit a draft using a `modify` function, implementing the following steps:

- Take an article modification form as input and a target article
- Fetch the target article from the DB
- Check that the article is a draft and return an error if not
- Patch the draft with the new data from the input
- Persist the patched draft in the DB
- Return the slug of the article

```ts
type ArticleModificationForm = {
  title: string;
  content: string;
};

class NotDraft extends Error {}

export async function modify(
  articleSlug: string,
  input: ArticleModificationForm,
  db: DB,
): AsyncResult<BackendError | NotDraft, string> {
  const readArticleResult = await db.read<Article>("articles", "slug");

  const modifyArticleResult = await readArticleResult
    .filterType(
      (a): a is ArticleTag["Draft"] => a._state === "Draft",
      () => new NotDraft("Only a draft can be modified"),
    )
    .map((draft) =>
      Article.Draft({
        ...draft,
        title: input.title,
        content: input.content,
      }),
    )
    .flatMapAsync((patched) => db.put("articles", patched.slug, patched));

  return modifyArticleResult.map((article) => article.slug);
}
```

The next function will allow authors to publish a draft.

So, we want it to implement the following steps:

- Fetch the article to publish from the DB
- Check that the fetched article is a draft, and return an error if not
- Transition the article from draft to published
- Persist the transitionned article in the DB
- Return the slug of the article

```ts
export async function publish(
  articleSlug: string,
  author: Author,
  db: DB,
): AsyncResult<BackendError | NotDraft, string> {
  const readArticleResult = await db.read<Article>("articles", articleSlug);

  const publishArticleResult = await readArticleResult
    .filterType(
      (art): art is ArticleTag["Draft"] => art._state === "Draft",
      () => new NotDraft("Only a draft can be published"),
    )
    .map((draft) =>
      Article.Published({
        ...draft,
        publishedBy: author.slug,
        publishedAt: new Date(),
      }),
    )
    .flatMapAsync((patched) => db.put("articles", patched.slug, patched));

  return publishArticleResult.map((article) => article.slug);
}
```

Finally, we can write the query functions.

For the articles, we will have two of these:

- One for the readers, that only fetches the published articles
- One for the authors, that will fetch all of them

```ts
export async function listPublished(): AsyncResult<BackendError, Article[]> {
  const listPublishedResult = await db.query<Article>("articles", {
    _state: "published",
  });

  return listPublishedResult;
}

export async function listAll(
  authorSlug: string,
  db: DB,
): AsyncResult<BackendError, Article[]> {
  const readAuthorResult = await db.read<Author>("authors", authorSlug);

  const listAllResult = await readAuthorResult.flatMapAsync(() =>
    db.query<Article>("articles", {}),
  );

  return listAllResult;
}
```

## Comment actions

The last behaviors to implement are those for the comments of the articles.

The first function we will write is the one that will allow readers to create comments.

It will implement the following steps:

- Take a comment creation form as input
- Check that the article referenced by the comment exist and return an error if not
- Create the comment in a "Published" state, from the data of the form
- Persist the comment in the DB
- Return an empty object to symbolize success

```ts
type CommentCreationForm = {
  commenterName: string;
  content: string;
};

export async function create(
  input: CommentCreationForm,
  articleSlug: string,
  db: DB,
): AsyncResult<BackendError, {}> {
  const readArticleResult = await db.read<Article>("articles", articleSlug);

  const createCommentResult = await readArticleResult
    .map(() =>
      Comment.Published({
        commentId: articleSlug + "-" + Date.now(),
        articleSlug: articleSlug,
        commenterName: input.commenterName,
        content: input.content,
        publishedAt: new Date(),
      }),
    )
    .flatMapAsync((comment) => db.put("comments", comment.commentId, comment));

  return createCommentResult.map(() => ({}));
}
```

Next, we want to write the function that will allow authors to remove inappropriate comments.

We'll need the following steps:

- Fetch the comment from the DB
- Check that the fetched comment has not been already removed, and return an error if it has
- Transition the comment from the "Published" state to the "Removed" state
- Persist the transitionned comment in the DB
- Return an empty object to symbolize success

```ts
class NotPublished extends Error {}

export async function remove(
  commentId: string,
  author: Author,
  db: DB,
): AsyncResult<BackendError | NotPublished, {}> {
  const readCommentResult = await db.read<Comment>("comments", commentId);

  const removeCommentResukt = await readCommentResult
    .filterType(
      (c): c is CommentTag["Published"] => c._state === "Published",
      () => new NotPublished("This comment has already been removed"),
    )
    .map((comment) =>
      Comment.Removed({
        ...comment,
        removedAt: new Date(),
        removedBy: author.slug,
      }),
    )
    .flatMapAsync((removed) => db.put("comments", removed.commentId, removed));

  return removeCommentResult.map(() => ({}));
}
```

Finally, we'll have to write a function that will query published comments for a specified article.

```ts
export async function listPublished(
  articleSlug: string,
  db: DB,
): AsynResult<BackendError, Comment[]> {
  const readPublishedResult = await db.query<Comment>({
    articleSlug: articleSlug,
    _state: "Published",
  });

  return readPublishedResult;
}
```

## What Shulk brings to the table

So, how did Shulk help us model our domain here?

If we take a look at all the code snippets above, we will see 3 things:

- State machines
- Pipelines
- No unhandled errors

Let's take a closer look.

### State machines

If we take a look at the way we modelized the articles and the comments, you'll notice something: they are both very simple state machines.

We just made impossible states of our domain irrepresentable in our code.

```ts
export const Article = union<{
  Draft: {
    slug: name;
    title: string;
    content: string;
  };
  Published: {
    slug: name;
    title: string;
    content: string;
    publishedBy: AuthorSlug;
    publishedAt: Date;
  };
}>();
```

A draft article has no author or publication date. If I try to use those properties on a draft, the TypeScript compiler will throw an error.

This is very interesting as now, the TypeScript compiler knows how my domain work and will help me when I'm implementing my logic.

When I create a published article, I cannot forget to set an author and a publication date: if I do, the compiler will throw an error.

This is quite simple, but incredibly powerful.

### Pipelines

In the implementations of our functions, you can see that large parts of the logic are taking the form of pipelines: we have connected several functions together in a way that the output of one is the input of another.

Remember the way we removed a published comment:

```ts
const removeCommentResult = await readCommentResult
  .filterType(
    (c): c is CommentTag["Published"] => c._state === "Published",
    () => new NotPublished("This comment has already been removed"),
  )
  .map((comment) =>
    Comment.Removed({
      ...comment,
      removedAt: new Date(),
      removedBy: author.slug,
    }),
  )
  .flatMapAsync((removed) => db.put("comments", removed.commentId, removed));
```

Let's break down this pipeline:

```ts
await readCommentResult;
```

> Fetch the comment from the DB

```ts
 .filterType(
      (c): c is CommentTag["Published"] => c._state === "Published",
      () => new NotPublished("This comment has already been removed"),
    )
```

> Check that the fetched comment has not been already removed, and return an error if it has

```ts
 .map((comment) =>
      Comment.Removed({
        ...comment,
        removedAt: new Date(),
        removedBy: author.slug,
      }),
    )
```

> Transition the comment from the "Published" state to the "Removed" state

```ts
.flatMapAsync((removed) => db.put("comments", removed.commentId, removed))
```

> Persist the transitionned comment in the DB

Do you get it?

Each function in our pipeline translates to a single step of our domain logic.

Pipelines allow us to regroup our code into declarative domain logic units.

Pretty cool.

### No unhandled errors

The last important thing that Shulk brings is error handling.

Each time we call our mocked DB, it can return a `BackendError`.

We know that thanks to the signature of the function:

```ts
type read = <T>(collection: string, id: string) => AsyncResult<BackendError, T>;
```

If we had used the TypeScript default way to handle errors (throwing & catching), we would have not know this.

This information would have been hidden in a documentation page that, being the classic developers we are, wouldn't even have read.

Of course, in this example we never do much about these errors, we only pass them "up".

But here's the thing:

1. We know they are here
2. We have full control over the execution flow
3. If we want to handle them in another way (say,retry a call when the previous one has failed), we can just add a `.mapErr` to our pipeline without changing the structure of the function.
