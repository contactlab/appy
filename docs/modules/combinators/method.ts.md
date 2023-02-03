---
title: combinators/method.ts
nav_order: 5
parent: Modules
---

## method overview

`Method` combinator: sets method on a `Req` and returns a `Req`.

**Warning:** the merging logic had to be "reversed" because of the contravariant nature of `Reader` and because the execution of combinators is from right to left (_function composition_).

This leads to a "weird" behavior for which the method provided when `Req` is run win over the one set with the combinator.

So, for example, if we have:

```ts
const request = pipe(appy.request, withMethod('GET'), withMethod('PUT'))

request(['http://some.endpoint', { method: 'POST' }])
```

when `request` is ran the underlying `fetch` call will be made with `POST` method.

Added in v4.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [withMethod](#withmethod)

---

# combinators

## withMethod

Sets provided method on `Req` and returns the updated `Req`.

**Signature**

```ts
export declare const withMethod: (method: string) => Combinator
```

Added in v4.0.0
