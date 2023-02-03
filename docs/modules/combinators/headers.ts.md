---
title: combinators/headers.ts
nav_order: 4
parent: Modules
---

## headers overview

`Headers` combinator: sets headers on a `Req` and returns a `Req`.

**Warning:** the merging logic had to be "reversed" because of the contravariant nature of `Reader` and because the execution of combinators is from right to left (_function composition_).

This leads to a "weird" behavior for which the headers provided when `Req` is run win over the ones set with the combinator.

So, for example, if we have:

```ts
const request = pipe(appy.get, withHeaders({ 'X-Foo': 'bar' }), withHeaders({ 'X-Foo': 'baz' }))

request(['http://some.endpoint', { headers: { 'X-Foo': 'foo' } }])
```

when `request` is ran the underlying `fetch` call will be made with a `X-Foo = 'foo'` header.

Added in v3.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [withHeaders](#withheaders)

---

# combinators

## withHeaders

Merges provided `Headers` with `Req` ones and returns the updated `Req`.

**Signature**

```ts
export declare const withHeaders: (headers: HeadersInit) => Combinator
```

Added in v3.0.0
