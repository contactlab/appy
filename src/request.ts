import {local} from 'fp-ts/lib/ReaderTaskEither';
import * as TU from 'fp-ts/lib/Tuple';
import {pipe} from 'fp-ts/lib/pipeable';
import {makeRequest} from './make-request';
import * as t from './types';
import * as u from './util';

/**
 * Makes a request using `fetch()` under the hood.
 *
 * The `data` in the returned `Resp` object is a `string` because the response's body can **always** be converted to text without error (via [`text()`](https://developer.mozilla.org/en-US/docs/Web/API/Body/text) method).
 *
 * Example:
 * ```ts
 * import {request} from '@contactlab/appy';
 * import {fold} from 'fp-ts/lib/Either';
 *
 * // Default method is GET like original `fetch()`
 * const users = request('https://reqres.in/api/users');
 *
 * users().then(
 *   fold(
 *     err => console.error(err),
 *     data => console.log(data)
 *   )
 * );
 * ```
 *
 * @category creators
 * @since 3.0.0
 */
export const request: t.Req<string> = makeRequest(fetch);

/**
 * Makes a request with the `method` set to `GET`.
 *
 * @category creators
 * @since 3.0.0
 */
export const get: t.Req<string> = pipe(request, local(setMethod('GET')));

/**
 * Makes a request with the `method` set to `POST`.
 *
 * @category creators
 * @since 3.0.0
 */
export const post: t.Req<string> = pipe(request, local(setMethod('POST')));

/**
 * Makes a request with the `method` set to `PUT`.
 *
 * @category creators
 * @since 3.0.0
 */
export const put: t.Req<string> = pipe(request, local(setMethod('PUT')));

/**
 * Makes a request with the `method` set to `PATCH`.
 *
 * @category creators
 * @since 3.0.0
 */
export const patch: t.Req<string> = pipe(request, local(setMethod('PATCH')));

/**
 * Makes a request with the `method` set to `DELETE`.
 *
 * @category creators
 * @since 3.0.0
 */
export const del: t.Req<string> = pipe(request, local(setMethod('DELETE')));

function setMethod(method: string): (input: t.ReqInput) => t.RequestInfoInit {
  return input =>
    pipe(
      u.normalizeReqInput(input),
      TU.mapLeft(init => ({...init, method}))
    );
}
