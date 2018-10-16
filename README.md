# Appy

[![Build Status](https://travis-ci.org/contactlab/appy.svg?branch=master)](https://travis-ci.org/contactlab/appy) [![Greenkeeper badge](https://badges.greenkeeper.io/contactlab/appy.svg)](https://greenkeeper.io/)

Fetch API the Contactlab way

## Install

```sh
$ npm install @contactlab/appy

# --- or ---

$ yarn add @contactlab/appy
```

## Motivation

Appy try to offer a better model for fetching resources, using the standard global `fetch()` function as a "backbone" and some principles from Functional Programming paradigm.

The model is built around the concepts of:

- asynchronous operations (`Task`)
- which can fail for some reason (`Either`)
- or return data with a specific shape that should be decoded/validated (`Decoder`).

In order to achieve this, Appy intensely uses:

- [Typescript](https://www.typescriptlang.org) >= v2.9
- [`fp-ts`](https://github.com/gcanti/fp-ts)
- [`io-ts`](https://github.com/gcanti/io-ts)

## API

**Note:** every sub module/lib is exported into the main `index.ts` file for a comfortable use.

### request

```typescript
import {get} from '@contactlab/appy';
// same as:
// import {get} from '@contactlab/appy/lib/request';

get('http://jsonplaceholder.typicode.com/posts')
  .run()
  .then(result =>
    result.fold(err => console.error(err), data => console.log(data))
  );
```

This is a low level module:
it uses the standard Web API Fetch function (`fetch`) in order to make a request to a resource
and wraps it in a `TaskEither` monad.

So, you can:

- use the standard, clean and widely supported api to make XHR;
- "project" it into a declarative functional world where execution is lazy (`Task`);
- handle "by design" the possibility of a failure with an explicit channel for errors (`Either`).

The module tries to be as more compliant as possible with the `fetch()` interface but with subtle differences:

- request `method` is always explicit (no implicit "GET");
- accepted methods are definened by the `Method` union type;
- `fetch`'s input is always a `string` (no `Request` objects allowed);
- `Response` is mapped into a specific `AppyResponse<Mixed>` interface;
- `AppyResponse` `headers` property is always a `HeadersMap` (alias for a map of string);
- `AppyResponse` has a `body` property that is the result of parsing to JSON the string returned from `response.text()`; if it cannot be parsed as JSON, `body` value is just the string (both types of data are covered by the `Mixed` type).

`RequestInit` configuration object instead remains the same.

#### Exports

See [here](src/request.ts) for the complete list of types.

```typescript
declare function request(
  m: Method,
  u: string,
  o?: RequestInit
): TaskEither<AppyError, AppyResponse<Mixed>>;
```

```typescript
declare function get(
  u: string,
  o?: RequestInit
): TaskEither<AppyError, AppyResponse<Mixed>>;
```

```typescript
declare function post(
  u: string,
  o?: RequestInit
): TaskEither<AppyError, AppyResponse<Mixed>>;
```

```typescript
declare function put(
  u: string,
  o?: RequestInit
): TaskEither<AppyError, AppyResponse<Mixed>>;
```

```typescript
declare function patch(
  u: string,
  o?: RequestInit
): TaskEither<AppyError, AppyResponse<Mixed>>;
```

```typescript
declare function del(
  u: string,
  o?: RequestInit
): TaskEither<AppyError, AppyResponse<Mixed>>;
```

### api

```typescript
import * as t from 'io-ts';
import {api} from '@contactlab/appy';
// same as:
// import {api} from '@contactlab/appy/lib/api';

const myApi = api({baseUri: 'http://jsonplaceholder.typicode.com'});
const token = 'secret';
const Posts = t.array(
  t.type({
    userId: t.number,
    id: t.number,
    title: t.string,
    body: t.string
  })
);

myApi
  .get('/posts', {token, decoder: Posts})
  .run()
  .then(result =>
    result.fold(err => console.error(err), data => console.log(data))
  );
```

This module is tailored on the needs of the Contactlab Frontend Team.
It uses the "low-level" `request` module in order to interact with Contactlab's services (REST API).

So, it is a little more opinionated:

- the exposed function (`api`) is used to "load" some configuration and returns an object with methods;
- the configuration has a required `baseUri` (string) key which will be prepended to every `uri`;
- there are also 2 optional keys `id` (string) and `version` (string) which will be passed as request's `headers`:
  - `'Contactlab-ClientId': ${id}`,
  - `'Contactlab-ClientVersion': ${version}`;
- the main `api` method is `request()` which uses under the hood the `request` module with some subtle differences:
  - the `options` parameter is mandatory and it is an extension of the `RequestInit` interface;
  - `options` has a required `token` (string) key which will be passed as request's `Authorization: Bearer ${token}` header;
  - `options` has a required `decoder` (`Decoder<Mixed, A>`) key which will be used to decode the service's JSON payload;
  - decoder errors are expressed with a `DecoderError` class which extends the `AppyError` tagged union type;
  - thus, the returned type of `api` methods is `TaskEither<ApiError, A>`
  - `headers` in `options` object can only be a map of strings (`{[k: string]: string}`); if you need to work with a `Header` object you have to transform it;
  - `options` is merged with a predefined object in order to set some default values:
    - `mode: 'cors'`
    - `headers: {'Accept': 'application/json', 'Content-type': 'application/json'}`

#### Exports

See [here](src/api.ts) for the complete list of types.

```typescript
interface ApiMethods {
  request: <A>(m: Method, u: string, o: ApiOptions<A>): TaskEither<ApiError, AppyResponse<A>>;

  get: <A>(u: string, o: ApiOptions<A>): TaskEither<ApiError, AppyResponse<A>>;

  post: <A>(u: string, o: ApiOptions<A>): TaskEither<ApiError, AppyResponse<A>>;

  put: <A>(u: string, o: ApiOptions<A>): TaskEither<ApiError, AppyResponse<A>>;

  patch: <A>(u: string, o: ApiOptions<A>): TaskEither<ApiError, AppyResponse<A>>;

  del: <A>(u: string, o: ApiOptions<A>): TaskEither<ApiError, AppyResponse<A>>;
}

declare function api(c: ApiConfig): ApiMethods
```

## Examples

You can find a couple of examples [here](examples).

## About `fetch()` compatibility

The Fetch API is available only on "modern" browsers: if you need to support legacy browsers (e.g. **Internet Explorer 11** or older) or you want to use it in a Nodejs script we recommend you the excellent [`isomorphic-fetch`](https://www.npmjs.com/package/isomorphic-fetch) package.

## Contributing

Opening issues is always welcome.

Then, fork the repository or create a new branch, write your code and send a pull request.

This project uses [Prettier](https://prettier.io/) (automatically applied as pre-commit hook), [TSLint](https://palantir.github.io/tslint/) and [Jest](https://facebook.github.io/jest/en/).

Tests are run with:

```sh
$ npm test
```

## License

Released under the [Apache 2.0](LICENSE) license.
