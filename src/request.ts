/*tslint:disable:max-classes-per-file*/

/**
 * This is a low level module:
 * it uses the standard Web API Fetch function (`fetch()`) in order to make a request to a resource
 * and wraps it in a `TaskEither` monad.
 *
 * So, you can:
 * - use the standard, clean and widely supported api to make XHR;
 * - "project" it into a declarative functional world where execution is lazy (`Task`);
 * - handle "by design" the possibility of a failure with an explicit channel for errors (`Either`).
 *
 * The module tries to be as more compliant as possible with the `fetch()` interface but with subtle differences:
 * - request `method` is always explicit (no implicit 'GET');
 * - accepted methods are definened by the `Method` union type;
 * - `fetch`'s input is always a `USVString` (no `Request` objects allowed);
 * - `Response` is mapped into a specific `AppyResponse<mixed>` interface where `mixed` is taken from `io-ts` lib;
 * - `AppyResponse` `headers` property is always a `HeadersMap` (alias for a map of string);
 * - `AppyResponse` has a `body` property that is the result of parsing to JSON the string returned from `response.text()`; if it cannot be parsed as JSON, `body` value is just the string (both types of data are covered by the `mixed` type).
 *
 * `RequestInit` configuration object instead remains the same.
 *
 * References:
 * - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 * - https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
 * - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 * - https://developer.mozilla.org/en-US/docs/Web/API/USVString
 * - https://developer.mozilla.org/en-US/docs/Web/API/Request
 * - https://gcanti.github.io/fp-ts/Task.html
 * - https://gcanti.github.io/fp-ts/Either.html
 * - https://gcanti.github.io/io-ts
 *
 * @module request
 */

import {Either, left, right} from 'fp-ts/lib/Either';
import {Task} from 'fp-ts/lib/Task';
import {TaskEither} from 'fp-ts/lib/TaskEither';

export type Mixed =
  | {[key: string]: any}
  | object
  | number
  | string
  | boolean
  | null;

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export interface HeadersMap {
  [k: string]: string;
}

export interface AppyRequest {
  (m: Method, u: USVString, o?: RequestInit): AppyTask<AppyError, Mixed>;
}

export interface AppyRequestNoMethod {
  (u: USVString, o?: RequestInit): AppyTask<AppyError, Mixed>;
}

export type AppyTask<E, A> = TaskEither<E, AppyResponse<A>>;

export interface AppyResponse<A> {
  headers: HeadersMap;
  status: number;
  statusText: string;
  url: string;
  body: A;
}

export type AppyError = NetworkError | BadUrl | BadResponse;

export class NetworkError {
  public readonly type: 'NetworkError' = 'NetworkError';
  constructor(readonly message: string, readonly uri: USVString) {}
}

export class BadUrl {
  public readonly type: 'BadUrl' = 'BadUrl';
  constructor(readonly url: string, readonly response: AppyResponse<Mixed>) {}
}

export class BadResponse {
  public readonly type: 'BadResponse' = 'BadResponse';
  constructor(readonly response: AppyResponse<Mixed>) {}
}

const toHeadersMap = (hs: Headers): HeadersMap => {
  const result: HeadersMap = {};

  hs.forEach((v: string, k: string) => {
    result[k] = v;
  });

  return result;
};

const parseBody = (a: string): Mixed => {
  try {
    return JSON.parse(a);
  } catch (e) {
    return a;
  }
};

const makeRequest = (
  m: Method,
  u: USVString,
  o?: RequestInit
): Task<Either<AppyError, AppyResponse<Mixed>>> =>
  new Task(() =>
    fetch(u, {...o, method: m})
      .then(
        resp =>
          resp
            .text()
            .then(parseBody)
            .then(body => ({resp, body})),
        (e: Error) => {
          throw new NetworkError(e.message, u);
        }
      )
      .then(({resp, body}) => {
        const aresp = {
          headers: toHeadersMap(resp.headers),
          status: resp.status,
          statusText: resp.statusText,
          url: resp.url,
          body
        };

        if (resp.ok) {
          return right<AppyError, AppyResponse<Mixed>>(aresp);
        }

        if (resp.status === 404) {
          throw new BadUrl(u, aresp);
        } else {
          throw new BadResponse(aresp);
        }
      })
      .catch((e: AppyError) => left<AppyError, AppyResponse<Mixed>>(e))
  );

export const request: AppyRequest = (method, uri, options) =>
  new TaskEither(makeRequest(method, uri, options));

export const get: AppyRequestNoMethod = (uri, options) =>
  request('GET', uri, options);

export const post: AppyRequestNoMethod = (uri, options) =>
  request('POST', uri, options);

export const put: AppyRequestNoMethod = (uri, options) =>
  request('PUT', uri, options);

export const patch: AppyRequestNoMethod = (uri, options) =>
  request('PATCH', uri, options);

export const del: AppyRequestNoMethod = (uri, options) =>
  request('DELETE', uri, options);
