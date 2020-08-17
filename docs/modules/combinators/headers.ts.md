---
title: combinators/headers.ts
nav_order: 3
parent: Modules
---

## headers overview

`Headers` combinator: sets headers on a `Req` and returns a `Req`.

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
export declare function withHeaders<A>(headers: HeadersInit): (req: Req<A>) => Req<A>
```

Added in v3.0.0
