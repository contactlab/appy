---
title: combinators/headers.ts
nav_order: 1
parent: Modules
---

# headers overview

`Headers` combinator: sets headers on a `Req` and returns a `Req`.

Added in v3.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [monoidHeaders](#monoidheaders)
- [withHeaders](#withheaders)

---

# monoidHeaders

Defines a `Monoid` instance for [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers#Examples) objects.

**Signature**

```ts
export const monoidHeaders: Monoid<HeadersInit> = ...
```

Added in v3.0.0

# withHeaders

Merges provided `Headers` with `Req` ones and returns the updated `Req`.

**Signature**

```ts
export function withHeaders<A>(hs: HeadersInit): (req: Req<A>) => Req<A> { ... }
```

Added in v3.0.0
