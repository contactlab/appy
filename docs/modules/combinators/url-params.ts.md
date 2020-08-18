---
title: combinators/url-params.ts
nav_order: 5
parent: Modules
---

## url-params overview

`URLSearchParams` combinator: sets query parameters to `Req`'s url and returns a `Req`.

Added in v3.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [withUrlParams](#withurlparams)

---

# combinators

## withUrlParams

Adds provided url search parameters (as `Record<string, string>`) to `Req`'s input url and returns the updated `Req`.

**Signature**

```ts
export declare function withUrlParams<A>(params: Record<string, string>): (req: Req<A>) => Req<A>
```

Added in v3.0.0
