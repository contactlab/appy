---
title: index.ts
nav_order: 1
parent: Modules
---

# index overview

appy - A functional wrapper around Fetch API.

Added in v3.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Req (interface)](#req-interface)
- [RequestError (interface)](#requesterror-interface)
- [Resp (interface)](#resp-interface)
- [ResponseError (interface)](#responseerror-interface)
- [Err (type alias)](#err-type-alias)
- [ReqInput (type alias)](#reqinput-type-alias)
- [RequestInfoInit (type alias)](#requestinfoinit-type-alias)
- [del](#del)
- [get](#get)
- [normalizeReqInput](#normalizereqinput)
- [patch](#patch)
- [post](#post)
- [put](#put)
- [request](#request)
- [toRequestError](#torequesterror)
- [toResponseError](#toresponseerror)

---

# Req (interface)

`Req<A>` encodes a resource's request, or rather, an async operation that can fail or return a `Resp<A>`.

The request is expressed in terms of `ReaderTaskEither` - a function that takes a `ReqInput` as parameter and returns a `TaskEither` - for better composability: we can act on both side of operation (input and output) with the tools provided by `fp-ts`.

**Signature**

```ts
export interface Req<A> extends RTE.ReaderTaskEither<ReqInput, Err, Resp<A>> {}
```

Added in v3.0.0

# RequestError (interface)

`RequestError` represents a request error. It carries the generated `Error` and the input of the request (`RequestInfoInit` tuple).

**Signature**

```ts
export interface RequestError {
  type: 'RequestError';
  error: Error;
  input: RequestInfoInit;
}
```

Added in v3.0.0

# Resp (interface)

`Resp<A>` is an object that carries the original `Response` from a `fetch()` call and the actual retrieved `data` (of type `A`).

**Signature**

```ts
export interface Resp<A> {
  response: Response;
  data: A;
}
```

Added in v3.0.0

# ResponseError (interface)

`ResponseError` represents a response error. It carriess the generated `Error` and the original `Response` object.

**Signature**

```ts
export interface ResponseError {
  type: 'ResponseError';
  error: Error;
  response: Response;
}
```

Added in v3.0.0

# Err (type alias)

`Err` encodes the two kind of error that can be generated by `Req`: a `RequestError` or a `ResponseError`.

**Signature**

```ts
export type Err = RequestError | ResponseError;
```

Added in v3.0.0

# ReqInput (type alias)

`ReqInput` encodes the `fetch()` parameters: a single [`RequestInfo`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters) (simple string or [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object) or a tuple of `RequestInfo` and [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters) (the object containing request's options, that it's optional in the original `fetch()` API).

**Signature**

```ts
export type ReqInput = RequestInfo | RequestInfoInit;
```

Added in v3.0.0

# RequestInfoInit (type alias)

An alias for a tuple of `RequesInfo` and `RequestInit` (a.k.a. the `fetch()` parameters).

**Signature**

```ts
export type RequestInfoInit = [RequestInfo, RequestInit];
```

Added in v3.0.0

# del

Makes a request with the `method` set to `DELETE`.

**Signature**

```ts
export const del: Req<string> = ...
```

Added in v3.0.0

# get

Makes a request with the `method` set to `GET`.

**Signature**

```ts
export const get: Req<string> = ...
```

Added in v3.0.0

# normalizeReqInput

Normalizes the input of a `Req` to a `RequestInfoInit` tuple even when only a single `RequestInfo` is provided.

**Signature**

```ts
export function normalizeReqInput(input: ReqInput): RequestInfoInit { ... }
```

Added in v3.0.0

# patch

Makes a request with the `method` set to `PATCH`.

**Signature**

```ts
export const patch: Req<string> = ...
```

Added in v3.0.0

# post

Makes a request with the `method` set to `POST`.

**Signature**

```ts
export const post: Req<string> = ...
```

Added in v3.0.0

# put

Makes a request with the `method` set to `PUT`.

**Signature**

```ts
export const put: Req<string> = ...
```

Added in v3.0.0

# request

Makes a request using `fetch()` under the hood.

The `data` in the returned `Resp` object is a `string` because the response's body can **always** be converted to text without errors (via [`text()`](https://developer.mozilla.org/en-US/docs/Web/API/Body/text) method).

Example:

```ts
import {request} from '@contactlab/appy';
import {fold} from 'fp-ts/lib/Either';

// GET method as default like original fetch()
const posts = request('http://jsonplaceholder.typicode.com/posts');

posts().then(
  fold(
    err => console.error(err),
    data => console.log(data)
  )
);
```

**Signature**

```ts
export const request: Req<string> = input => () => ...
```

Added in v3.0.0

# toRequestError

Creates a `RequestError` object.

**Signature**

```ts
export function toRequestError(
  error: Error,
  input: RequestInfoInit
): RequestError { ... }
```

Added in v3.0.0

# toResponseError

Creates a `ResponseError` object.

**Signature**

```ts
export function toResponseError(
  error: Error,
  response: Response
): ResponseError { ... }
```

Added in v3.0.0