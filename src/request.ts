/**
 * `Request` module: defines the `appy`'s base types and functions.
 *
 * **Note:**: this module has been designed for internal use; please prefer the re-exported version of `appy/index`.
 *
 * @since 4.0.0
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API|Fetch Api}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch|Global fetch}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch|Using fetch}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Request|Request}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response|Response}
 * @see {@link https://gcanti.github.io/fp-ts/ReaderTaskEither.html|ReaderTaskEither}
 */

import * as E from 'fp-ts/Either';
import {ReaderTaskEither} from 'fp-ts/ReaderTaskEither';

/**
 * `Req<A>` encodes a resource's request, or rather, an async operation that can fail or return a `Resp<A>`.
 *
 * The request is expressed in terms of `ReaderTaskEither` - a function that takes a `ReqInput` as parameter and returns a `TaskEither` - for better composability: we can act on both side of operation (input and output) with the tools provided by `fp-ts`.
 *
 * @category Request
 * @since 4.0.0
 */
export interface Req<A> extends ReaderTaskEither<ReqInput, Err, Resp<A>> {}

/**
 * `ReqInput` encodes the `fetch()` parameters: a single [`RequestInfo`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters) (simple string or [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object) or a tuple of `RequestInfo` and [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters) (the object containing request's options, that it's optional in the original `fetch()` API).
 *
 * @category Request
 * @since 4.0.0
 */
export type ReqInput = RequestInfo | RequestInfoInit;
/**
 * An alias for a tuple of `RequesInfo` and `RequestInit` (a.k.a. the `fetch()` parameters).
 *
 * @category Request
 * @since 4.0.0
 */
export type RequestInfoInit = [RequestInfo, RequestInit];

/**
 * A combinator is a function to transform/operate on a `Req`.
 *
 * @category Request
 * @since 5.1.0
 */
export type Combinator = <A>(req: Req<A>) => Req<A>;

/**
 * `Resp<A>` is an object that carries the original `Response` from a `fetch()` call and the actual retrieved `data` (of type `A`).
 *
 * @category Response
 * @since 4.0.0
 */
export interface Resp<A> {
  response: Response;
  data: A;
}

/**
 * `Err` encodes the two kind of error that can be generated by `Req`: a `RequestError` or a `ResponseError`.
 *
 * @category Error
 * @since 4.0.0
 */
export type Err = RequestError | ResponseError;

/**
 * `RequestError` represents a request error. It carries the generated `Error` and the input of the request (`RequestInfoInit` tuple).
 *
 * @category Error
 * @since 4.0.0
 */
export interface RequestError {
  type: 'RequestError';
  error: Error;
  input: RequestInfoInit;
}

/**
 * `ResponseError` represents a response error. It carriess the generated `Error` and the original `Response` object.
 *
 * @category Error
 * @since 4.0.0
 */
export interface ResponseError {
  type: 'ResponseError';
  error: Error;
  response: Response;
}

type BodyTypeKey = {
  [K in keyof Response]-?: Response[K] extends () => Promise<unknown>
    ? K
    : never;
}[keyof Response] &
  string;

type BodyTypeData<K extends BodyTypeKey> = ReturnType<
  Response[K]
> extends Promise<infer _A>
  ? _A
  : never;

/**
 * Return a `Req` which will be executed using `fetch()` under the hood.
 *
 * The `data` in the returned `Resp` object is of the type specified in the `type` parameter which is one of [supported `Request` methods](https://developer.mozilla.org/en-US/docs/Web/API/Response#instance_methods).
 *
 * Example:
 * ```ts
 * import {requestAs} from '@contactlab/appy';
 * import {match} from 'fp-ts/Either';
 *
 * // Default method is GET like original `fetch()`
 * const users = requestAs('json')('https://reqres.in/api/users');
 *
 * users().then(
 *   match(
 *     err => console.error(err),
 *     data => console.log(data)
 *   )
 * );
 * ```
 *
 * @category creators
 * @since 5.1.0
 */
export const requestAs =
  <K extends BodyTypeKey>(type: K): Req<BodyTypeData<K>> =>
  input =>
  () => {
    const reqInput = normalizeReqInput(input);

    return fetch(...reqInput)
      .then(async response => {
        if (!response.ok) {
          return E.left(
            toResponseError(
              new Error(
                `Request responded with status code ${response.status}`
              ),
              response
            )
          );
        }

        const data = await response[type]();

        return E.right({response, data});
      })
      .catch(e => E.left(toRequestError(e, reqInput)));
  };

/**
 * Makes a request using `fetch()` under the hood.
 *
 * The `data` in the returned `Resp` object is a `string` because the response's body can **always** be converted to text without error (via [`text()`](https://developer.mozilla.org/en-US/docs/Web/API/Body/text) method).
 *
 * Example:
 * ```ts
 * import {request} from '@contactlab/appy';
 * import {match} from 'fp-ts/Either';
 *
 * // Default method is GET like original `fetch()`
 * const users = request('https://reqres.in/api/users');
 *
 * users().then(
 *   match(
 *     err => console.error(err),
 *     data => console.log(data)
 *   )
 * );
 * ```
 *
 * @category creators
 * @since 4.0.0
 */
export const request: Req<string> = requestAs('text');

/**
 * Creates a `RequestError` object.
 *
 * @category Error
 * @since 4.0.0
 */
export const toRequestError = (
  error: Error,
  input: RequestInfoInit
): RequestError => ({type: 'RequestError', error, input});

/**
 * Creates a `ResponseError` object.
 *
 * @category Error
 * @since 4.0.0
 */
export const toResponseError = (
  error: Error,
  response: Response
): ResponseError => ({type: 'ResponseError', response, error});

/**
 * Normalizes the input of a `Req` to a `RequestInfoInit` tuple even when only a single `RequestInfo` is provided.
 *
 * @category Request
 * @since 4.0.0
 */
export const normalizeReqInput = (input: ReqInput): RequestInfoInit =>
  Array.isArray(input) ? input : [input, {}];
