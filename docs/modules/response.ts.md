---
title: response.ts
nav_order: 9
parent: Modules
---

## response overview

`Response` module: exports utilites to work with `Response` objects.

Added in v4.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [helpers](#helpers)
  - [cloneResponse](#cloneresponse)

---

# helpers

## cloneResponse

Clones a `Response` object with the provided content as body.

**Warning:** if the content is a plain object and _stringifying_ it fails, the cloned `Response`'s body will be set to `null` (the default value).

**Signature**

```ts
export declare const cloneResponse: <A>(from: Response, content: A) => Response
```

Added in v4.0.1
