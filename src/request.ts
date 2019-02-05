/**
 * @module request
 * @since 1.0.0
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API|Fetch Api}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch|Global fetch}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch|Using fetch}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Request|Request}
 * @see {@link https://gcanti.github.io/fp-ts/Task.html|Task}
 * @see {@link https://gcanti.github.io/fp-ts/Either.html|Either}
 * @see {@link https://gcanti.github.io/fp-ts/TaskEither.html|TaskEither}
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
  (m: Method, u: string, o?: RequestInit): AppyTask<AppyError, Mixed>;
}

export interface AppyRequestNoMethod {
  (u: string, o?: RequestInit): AppyTask<AppyError, Mixed>;
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

export interface NetworkError {
  readonly type: 'NetworkError';
  readonly message: string;
  readonly uri: string;
}

const networkError = (message: string, uri: string): NetworkError => ({
  type: 'NetworkError',
  message,
  uri
});

export interface BadUrl {
  readonly type: 'BadUrl';
  readonly url: string;
  readonly response: AppyResponse<Mixed>;
}

const badUrl = (url: string, response: AppyResponse<Mixed>): BadUrl => ({
  type: 'BadUrl',
  url,
  response
});

export interface BadResponse {
  readonly type: 'BadResponse';
  readonly response: AppyResponse<Mixed>;
}

const badResponse = (response: AppyResponse<Mixed>): BadResponse => ({
  type: 'BadResponse',
  response
});

const makeRequest = (
  m: Method,
  u: string,
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
          throw networkError(e.message, u);
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
          throw badUrl(u, aresp);
        } else {
          throw badResponse(aresp);
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

// --- Helpers
function toHeadersMap(hs: Headers): HeadersMap {
  const result: HeadersMap = {};

  hs.forEach((v: string, k: string) => {
    result[k] = v;
  });

  return result;
}

function parseBody(a: string): Mixed {
  try {
    return JSON.parse(a);
  } catch (e) {
    return a;
  }
}
