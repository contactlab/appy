# @contactlab/appy

![Node CI](https://github.com/contactlab/appy/workflows/Node%20CI/badge.svg) ![npm (scoped)](https://img.shields.io/npm/v/@contactlab/appy?logo=npm) ![node-current (scoped)](https://img.shields.io/node/v/@contactlab/appy) ![GitHub package.json dependency version (dev dep on branch)](https://img.shields.io/github/package-json/dependency-version/contactlab/appy/dev/typescript) ![GitHub package.json dependency version (dev dep on branch)](https://img.shields.io/github/package-json/dependency-version/contactlab/appy/dev/fp-ts) ![GitHub](https://img.shields.io/github/license/contactlab/appy)

A functional wrapper around Fetch API.

## Install

```sh
$ npm install @contactlab/appy fp-ts

# --- or ---

$ yarn add @contactlab/appy fp-ts
```

## Motivation

`appy` tries to offer a better model for fetching resources, using the standard global `fetch()` function as a "backbone" and some principles from Functional Programming paradigm.

The model is built around the concepts of:

- a function with some configurable options (`Reader`)
- that runs asynchronous operations (`Task`)
- which can fail for some reason (`Either`)

In order to achieve this, `appy` intensely uses:

- [Typescript](https://www.typescriptlang.org) >= v3.2.2
- [`fp-ts`](https://github.com/gcanti/fp-ts)

## API

`appy` exposes a simple core API that can be extended with ["combinators"](#combinators).

It encodes through the `Req<A>` type a resource's request, or rather, an async operation that can fail or return a `Resp<A>`.

For better composability, the request is expressed in terms of `ReaderTaskEither` - a function that takes a `ReqInput` as parameter and returns a `TaskEither`: we can act on both side of operation (input and output) with the tools provided by `fp-ts`.

```ts
interface Req<A> extends ReaderTaskEither<ReqInput, Err, Resp<A>> {}
```

`ReqInput` encodes the `fetch()` parameters: a single [`RequestInfo`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters) (simple string or [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object) or a tuple of `RequestInfo` and [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters) (the object containing request's options, that it's optional in the original `fetch()` API).

```ts
type ReqInput = RequestInfo | RequestInfoInit;

// Just an alias for a tuple of `RequesInfo` and `RequestInit` (namely the `fetch()` parameters)
type RequestInfoInit = [RequestInfo, RequestInit];
```

`Resp<A>` is an object that carries the original `Response` from a `fetch()` call and the actual retrieved `data` (of type `A`).

```ts
interface Resp<A> {
  response: Response;
  data: A;
}
```

`Err` encodes (as tagged union) the two kind of error that can be generated by `Req`: a `RequestError` or a `ResponseError`.

```ts
type Err = RequestError | ResponseError;
```

`RequestError` represents a request error. It carries the generated `Error` and the input of the request (`RequestInfoInit` tuple).

```ts
interface RequestError {
  type: 'RequestError';
  error: Error;
  input: RequestInfoInit;
}
```

`ResponseError` represents a response error. It carries the generated `Error` and the original `Response` object.

```ts
interface ResponseError {
  type: 'ResponseError';
  error: Error;
  response: Response;
}
```

## Examples

```ts
import {get} from '@contactlab/appy';
import {fold} from 'fp-ts/lib/Either';

const users = get('https://reqres.in/api/users');

users().then(
  fold(
    err => console.error(err),
    resp => console.log(resp.data)
  )
);
```

You can find other examples [here](https://github.com/contactlab/appy/tree/master/examples).

## Combinators

To make easier extending the library functionalities, any other feature should then be expressed as a simple combinator `Req<A> => Req<A>`.

So, for example, decoding the response body as JSON:

```ts
import {get} from '@contactlab/appy';
import {withDecoder, Decoder} from '@contactlab/appy/combinators/decoder';
import {pipe} from 'fp-ts/lib/pipeable';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

declare const userDec: Decoder<User>;

const getUser = pipe(get, withDecoder(userDec));

const singleUser = getUser('https://reqres.in/api/users/1');
```

or adding headers to the request:

```ts
import {get} from '@contactlab/appy';
import {withHeaders} from '@contactlab/appy/combinators/headers';

const asJson = pipe(get, withHeaders({'Content-Type': 'application/json'}));

const users = asJson('https://reqres.in/api/users');
```

or setting request's body (for `POST`s or `PUT`s):

```ts
import {post} from '@contactlab/appy';
import {withBody} from '@contactlab/appy/combinators/body';
import {pipe} from 'fp-ts/lib/pipeable';

const send = pipe(
  post,
  withBody({email: 'foo.bar@mail.com', first_name: 'Foo', last_name: 'Bar'})
);

const addUser = send('https://reqres.in/api/users');
```

### `io-ts` integration

[`io-ts`](https://github.com/gcanti/io-ts) is recommended but not automatically installed as dependency.

In order to use it with the `Decoder` combinator you can write a simple helper like:

```ts
import * as t from 'io-ts';
import {failure} from 'io-ts/lib/PathReporter';
import {Decoder, toDecoder} from '@contactlab/appy/combinators/decoder';

export const fromIots = <A>(d: t.Decoder<unknown, A>): Decoder<A> =>
  toDecoder(d.decode, e => new Error(failure(e).join('\n')));
```

Or, with the [Decoder](https://gcanti.github.io/io-ts/modules/Decoder.ts.html) module:

```ts
import * as D from 'io-ts/lib/Decoder';
import {Decoder, toDecoder} from '@contactlab/appy/combinators/decoder';

export const fromIots = <A>(d: D.Decoder<A>): Decoder<A> =>
  toDecoder(d.decode, e => new Error(D.draw(e))
```

## About `fetch()` compatibility

The Fetch API is available only on "modern" browsers: if you need to support legacy browsers (e.g. **Internet Explorer 11** or older) or you want to use it in a Nodejs script we recommend you the excellent [`cross-fetch`](https://www.npmjs.com/package/cross-fetch) package.

**Be aware that Nodejs lacks of some classes and directives which have to be exposed to the global scope (check out the [tests setup file](https://github.com/contactlab/appy/blob/master/test/_setup.ts)).**

### Publish a new version

In order to keep the package's file structure as flat as possible, the "usual" npm `publish` command was disabled (via a `prepublishOnly` script) in favour of a `release` script:

```sh
$ npm run release
```

This command will execute `npm publish` directly in the `/dist` folder, where the `postbuild` script previously copied the `package.json` and other usefull files (`LICENSE`, `CHANGELOG.md`, etc...).

## License

Released under the [Apache 2.0](https://github.com/contactlab/appy/blob/master/LICENSE) license.
