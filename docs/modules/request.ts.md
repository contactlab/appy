---
title: request.ts
nav_order: 8
parent: Modules
---

## request overview

`Request` module: defines the `appy`'s base types and functions.

**Note:**: this module has been designed for internal use; please prefer the re-exported version of `appy/index`.

Added in v4.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Error](#error)
  - [Err (type alias)](#err-type-alias)
  - [RequestError (interface)](#requesterror-interface)
  - [ResponseError (interface)](#responseerror-interface)
  - [toRequestError](#torequesterror)
  - [toResponseError](#toresponseerror)
- [Request](#request)
  - [Combinator (type alias)](#combinator-type-alias)
  - [Req (interface)](#req-interface)
  - [ReqInput (type alias)](#reqinput-type-alias)
  - [RequestInfoInit (type alias)](#requestinfoinit-type-alias)
  - [normalizeReqInput](#normalizereqinput)
- [Response](#response)
  - [Resp (interface)](#resp-interface)
- [creators](#creators)
  - [request](#request)
  - [requestAs](#requestas)

---

# Error

## Err (type alias)

`Err` encodes the two kind of error that can be generated by `Req`: a `RequestError` or a `ResponseError`.

**Signature**

```ts
export type Err = RequestError | ResponseError
```

Added in v4.0.0

## RequestError (interface)

`RequestError` represents a request error. It carries the generated `Error` and the input of the request (`RequestInfoInit` tuple).

**Signature**

```ts
export interface RequestError {
  type: 'RequestError'
  error: Error
  input: RequestInfoInit
}
```

Added in v4.0.0

## ResponseError (interface)

`ResponseError` represents a response error. It carriess the generated `Error`, the original `Response` object and the request's input (optional).

**Signature**

```ts
export interface ResponseError {
  type: 'ResponseError'
  error: Error
  response: Response
  input?: RequestInfoInit
}
```

Added in v4.0.0

## toRequestError

Creates a `RequestError` object.

**Signature**

```ts
export declare const toRequestError: (error: Error, input: RequestInfoInit) => RequestError
```

Added in v4.0.0

## toResponseError

Creates a `ResponseError` object.

**Signature**

```ts
export declare const toResponseError: (
  error: Error,
  response: Response,
  input?: RequestInfoInit | undefined
) => ResponseError
```

Added in v4.0.0

# Request

## Combinator (type alias)

A combinator is a function to transform/operate on a `Req`.

**Signature**

```ts
export type Combinator = <A>(req: Req<A>) => Req<A>
```

Added in v5.1.0

## Req (interface)

`Req<A>` encodes a resource's request, or rather, an async operation that can fail or return a `Resp<A>`.

The request is expressed in terms of `ReaderTaskEither` - a function that takes a `ReqInput` as parameter and returns a `TaskEither` - for better composability: we can act on both side of operation (input and output) with the tools provided by `fp-ts`.

**Signature**

```ts
export interface Req<A> extends ReaderTaskEither<ReqInput, Err, Resp<A>> {}
```

Added in v4.0.0

## ReqInput (type alias)

`ReqInput` encodes the `fetch()` parameters: a single [`RequestInfo`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters) (simple string or [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object) or a tuple of `RequestInfo` and [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters) (the object containing request's options, that it's optional in the original `fetch()` API).

**Signature**

```ts
export type ReqInput = RequestInfo | RequestInfoInit
```

Added in v4.0.0

## RequestInfoInit (type alias)

An alias for a tuple of `RequesInfo` and `RequestInit` (a.k.a. the `fetch()` parameters).

**Signature**

```ts
export type RequestInfoInit = [RequestInfo, RequestInit]
```

Added in v4.0.0

## normalizeReqInput

Normalizes the input of a `Req` to a `RequestInfoInit` tuple even when only a single `RequestInfo` is provided.

**Signature**

```ts
export declare const normalizeReqInput: (input: ReqInput) => RequestInfoInit
```

Added in v4.0.0

# Response

## Resp (interface)

`Resp<A>` is an object that carries the original `Response` from a `fetch()` call, the actual retrieved `data` (of type `A`) and the request's input (optional).

**Signature**

```ts
export interface Resp<A> {
  response: Response
  data: A
  input?: RequestInfoInit
}
```

Added in v4.0.0

# creators

## request

Makes a request using `fetch()` under the hood.

The `data` in the returned `Resp` object is a `string` because the response's body can **always** be converted to text without error (via [`text()`](https://developer.mozilla.org/en-US/docs/Web/API/Body/text) method).

Example:

```ts
import { request } from '@contactlab/appy'
import { match } from 'fp-ts/Either'

// Default method is GET like original `fetch()`
const users = request('https://reqres.in/api/users')

users().then(
  match(
    (err) => console.error(err),
    (data) => console.log(data)
  )
)
```

**Signature**

```ts
export declare const request: Req<string>
```

Added in v4.0.0

## requestAs

Return a `Req` which will be executed using `fetch()` under the hood.

The `data` in the returned `Resp` object is of the type specified in the `type` parameter which is one of [supported `Request` methods](https://developer.mozilla.org/en-US/docs/Web/API/Response#instance_methods).

Example:

```ts
import { requestAs } from '@contactlab/appy'
import { match } from 'fp-ts/Either'

// Default method is GET like original `fetch()`
const users = requestAs('json')('https://reqres.in/api/users')

users().then(
  match(
    (err) => console.error(err),
    (data) => console.log(data)
  )
)
```

**Signature**

```ts
export declare const requestAs: <K extends BodyTypeKey>(type: K) => Req<BodyTypeData<K>>
```

Added in v5.1.0
