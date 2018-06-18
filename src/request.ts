/*tslint:disable:max-classes-per-file*/

/**
 * This is a low level module:
 * it uses the standard Web API Fetch function (`fetch()`) in order to make a request to a resource
 * and wraps it in a `Task<Either>` monad.
 *
 * So, you can:
 * - use the standard, clean and widely supported api to make XHR;
 * - "project" it into a declarative functional world where execution is lazy (`Task`);
 * - handle "by design" the possibility of a failure with an explicit channel for errors (`Either`).
 *
 * The module tries to be as more compliant as possible with the `fetch()` interface but with subtle differences:
 * - request `method` is always explicit (no implicit 'GET');
 * - accepted methods are definened by the `Method` union type;
 * - `fetch`'s input is always a `USVString` (no `Request` objects allowed).
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
 *
 * @module request
 */

import {Either, left, right} from 'fp-ts/lib/Either';
import {Task} from 'fp-ts/lib/Task';

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export class NetworkError {
  public readonly type: 'NetworkError' = 'NetworkError';
  constructor(readonly message: string, readonly uri: USVString) {}
}

export class BadUrl {
  public readonly type: 'BadUrl' = 'BadUrl';
  constructor(readonly url: string, readonly response: Response) {}
}

export class BadResponse {
  public readonly type: 'BadResponse' = 'BadResponse';
  constructor(readonly response: Response) {}
}

export type RequestError = NetworkError | BadUrl | BadResponse;

export type AppyResponse = Task<Either<RequestError, Response>>;

export interface AppyRequest {
  (m: Method, u: USVString, o?: RequestInit): AppyResponse;
}

export interface AppyRequesImplicitMethod {
  (u: USVString, o?: RequestInit): AppyResponse;
}

export const request: AppyRequest = (method, uri, options) =>
  new Task(() =>
    fetch(uri, {...options, method})
      .then(
        resp => {
          if (resp.ok) {
            return right<RequestError, Response>(resp);
          }

          if (resp.status === 404) {
            throw new BadUrl(uri, resp);
          } else {
            throw new BadResponse(resp);
          }
        },
        (e: Error) => {
          throw new NetworkError(e.message, uri);
        }
      )
      .catch((e: RequestError) => left<RequestError, Response>(e))
  );

export const get: AppyRequesImplicitMethod = (uri, options) =>
  request('GET', uri, options);

export const post: AppyRequesImplicitMethod = (uri, options) =>
  request('POST', uri, options);

export const put: AppyRequesImplicitMethod = (uri, options) =>
  request('PUT', uri, options);

export const patch: AppyRequesImplicitMethod = (uri, options) =>
  request('PATCH', uri, options);

export const del: AppyRequesImplicitMethod = (uri, options) =>
  request('DELETE', uri, options);
