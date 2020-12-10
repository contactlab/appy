/**
 * appy - A functional wrapper around Fetch API.
 *
 * Please refer to [`request` module](request.ts.html) for `Request` related documentation.
 *
 * @since 3.0.0
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API|Fetch Api}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch|Global fetch}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch|Using fetch}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Request|Request}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response|Response}
 * @see {@link https://gcanti.github.io/fp-ts/ReaderTaskEither.html|ReaderTaskEither}
 */

import {pipe} from 'fp-ts/lib/pipeable';
import {withMethod} from './combinators/method';
import {Req, request} from './request';

/**
 * @since 3.0.0
 */
export * from './request';

/**
 * Makes a request with the `method` set to `GET`.
 *
 * @category creators
 * @since 3.0.0
 */
export const get: Req<string> = pipe(request, withMethod('GET'));

/**
 * Makes a request with the `method` set to `POST`.
 *
 * @category creators
 * @since 3.0.0
 */
export const post: Req<string> = pipe(request, withMethod('POST'));

/**
 * Makes a request with the `method` set to `PUT`.
 *
 * @category creators
 * @since 3.0.0
 */
export const put: Req<string> = pipe(request, withMethod('PUT'));

/**
 * Makes a request with the `method` set to `PATCH`.
 *
 * @category creators
 * @since 3.0.0
 */
export const patch: Req<string> = pipe(request, withMethod('PATCH'));

/**
 * Makes a request with the `method` set to `DELETE`.
 *
 * @category creators
 * @since 3.0.0
 */
export const del: Req<string> = pipe(request, withMethod('DELETE'));
