---
title: combinators/url-params.ts
nav_order: 5
parent: Modules
---

## url-params overview

`URLSearchParams` combinator: sets query parameters to `Req`'s url and returns a `Req`.

**Warning:** the merging logic had to be "reversed" because of the contravariant nature of `Reader` and because the execution of combinators is from right to left (_function composition_).

This leads to a "weird" behavior for which the url's parameters provided when `Req` is run win over the ones set with the combinator.

So, for example, if we have:

```ts
const request = pipe(appy.get, withUrlParams({ foo: 'bar', baz: String(null) }))

request('http://some.endpoint?foo=aaa')
```

the url of `fetch` call will be `http://some.endpoint?foo=aaa&baz=null`.

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
