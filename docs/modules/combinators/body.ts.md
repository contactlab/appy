---
title: combinators/body.ts
nav_order: 2
parent: Modules
---

## body overview

`body` combinator: sets body on a `Req` and returns a `Req`.

**Warning:** the merging logic had to be "reversed" because of the contravariant nature of `Reader` and because the execution of combinators is from right to left (_function composition_).

This leads to a "weird" behavior for which the body provided when `Req` is run wins over the one set with the combinator.

So, for example, if we have:

```ts
const body1 = { id: 123, name: 'foo bar' }
const body2 = { id: 456, name: 'baz aaa' }

const request = pipe(appy.post, withBody(body1))

request(['http://some.endpoint', { body: JSON.stringify(body2) }])
```

when `request` is ran the underlying `fetch` call will be made with a `"{'id': 456, 'name': 'baz aaa'}"` body.

Added in v3.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [withBody](#withbody)

---

# combinators

## withBody

Sets the provided `body` (automatically converted to string when JSON) on `Req` init object and returns the updated `Req`.

**Signature**

```ts
export declare function withBody<A>(body: unknown): (req: Req<A>) => Req<A>
```

Added in v3.0.0
