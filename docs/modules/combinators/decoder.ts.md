---
title: combinators/decoder.ts
nav_order: 2
parent: Modules
---

## decoder overview

`Decoder` combinator: decodes `Resp` of a `Req<A>` and returns a `Req<B>`.

Added in v3.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Decoder](#decoder)
  - [Decoder (interface)](#decoder-interface)
  - [GenericDecoder (interface)](#genericdecoder-interface)
- [combinators](#combinators)
  - [withDecoder](#withdecoder)
- [helpers](#helpers)
  - [toDecoder](#todecoder)

---

# Decoder

## Decoder (interface)

A specialization of a `GenericDecoder` with `Left` type fixed to `Error`.

**Signature**

```ts
export interface Decoder<A> extends GenericDecoder<Error, A> {}
```

Added in v3.0.0

## GenericDecoder (interface)

Encodes a generic decoder, namely a function which takes an `unknown` input (usually a JSON object) and tries to decode it, returning a `Right<A>` if it succeeds or a `Left<E>` otherwise.

**Signature**

```ts
export interface GenericDecoder<E, A> extends ReaderEither<unknown, E, A> {}
```

Added in v3.0.0

# combinators

## withDecoder

Applies `Decoder<B>` to the `Resp<A>` of a `Req` converting it to a `Resp<B>`.

It returns a `Left<ResponseError>` in case the decoding fails.

It automatically sets "JSON" request header's

**Signature**

```ts
export declare function withDecoder<A, B>(
  decoder: Decoder<B>
): (req: Req<A>) => Req<B>;
```

Added in v3.0.0

# helpers

## toDecoder

Converts a `GenericDecoder<E, A>` into a `Decoder<A>`.

**Signature**

```ts
export declare function toDecoder<E, A>(
  dec: GenericDecoder<E, A>,
  onLeft: (e: E) => Error
): Decoder<A>;
```

Added in v3.0.0
