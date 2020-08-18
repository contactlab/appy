---
title: combinators/abort.ts
nav_order: 1
parent: Modules
---

## abort overview

`abort` combinators: cancel requests via `AbortController`.

#### About `AbortController` compatibility

[`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) is an experimental technology defined in the current DOM specification.

Thus, it is not supported by [old browsers](https://caniuse.com/#search=AbortController) (e.g. IE11) and Nodejs environments.

We suggest you to use a polyfill (check out the [`_setup.ts`](https://github.com/contactlab/appy/blob/master/test/_setup.ts) file in the test folder) like:

- [abort-controller](https://www.npmjs.com/package/abort-controller)
- [abortcontroller-polyfill](https://www.npmjs.com/package/abortcontroller-polyfill)

Added in v3.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [withCancel](#withcancel)
  - [withTimeout](#withtimeout)

---

# combinators

## withCancel

Sets `signal` on `Req` in order to make request cancellable through `AbortController`.

Example:

```ts
import { request } from '@contactlab/appy'
import { withCancel } from '@contactlab/appy/combinators/abort'
import { isLeft } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'

const controller = new AbortController()

const requestWithCancel = pipe(request, withCancel(controller))
const users = requestWithCancel('https://reqres.in/api/users')

controller.abort()

users().then((result) => {
  assert.ok(isLeft(result))
})
```

**Signature**

```ts
export declare function withCancel<A>(controller: AbortController): (req: Req<A>) => Req<A>
```

Added in v3.1.0

## withTimeout

Aborts the request if it does not respond within provided milliseconds.

Example:

```ts
import { request } from '@contactlab/appy'
import { withTimeout } from '@contactlab/appy/combinators/abort'
import { isLeft } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'

const requestWithTimeout = pipe(request, withTimeout(500))
const users = requestWithTimeout('https://reqres.in/api/users')

users().then((result) => {
  assert.ok(isLeft(result)) // <-- because timeout is really small
})
```

**Signature**

```ts
export declare function withTimeout<A>(millis: number): (req: Req<A>) => Req<A>
```

Added in v3.1.0
