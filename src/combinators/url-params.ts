/**
 * `URLSearchParams` combinator: sets query parameters to `Req`'s url and returns a `Req`.
 *
 * **Warning:** the merging logic had to be "reversed" because of the contravariant nature of `Reader` and because the execution of combinators is from right to left (_function composition_).
 *
 * This leads to a "weird" behavior for which the url's parameters provided when `Req` is run win over the ones set with the combinator.
 *
 * So, for example, if we have:
 * ```ts
 * const request = pipe(appy.get, withUrlParams({foo: 'bar', baz: String(null)}));
 *
 * request('http://some.endpoint?foo=aaa')
 * ```
 * the url of `fetch` call will be `http://some.endpoint?foo=aaa&baz=null`.
 *
 * @since 3.0.0
 */

import * as E from 'fp-ts/Either';
import * as RTE from 'fp-ts/ReaderTaskEither';
import {pipe} from 'fp-ts/function';
import {
  type Err,
  type Req,
  type ReqInput,
  type RequestInfoInit,
  type Combinator,
  normalizeReqInput,
  toRequestError
} from '../request';

/**
 * @category URLSearchParams
 * @since 4.0.0
 */
export type Params = Record<string, string>;

/**
 * Adds provided url search parameters (as `Record<string, string>`) to `Req`'s input url and returns the updated `Req`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const withUrlParams =
  (params: Params): Combinator =>
  req =>
    pipe(prepare(params), RTE.chain(setURLParams(req)));

const setURLParams =
  <A>(req: Req<A>) =>
  (input: RequestInfoInit): Req<A> =>
    pipe(
      req,
      RTE.local(() => input)
    );

interface RTEInfoInit
  extends RTE.ReaderTaskEither<ReqInput, Err, RequestInfoInit> {}

const prepare = (params: Params): RTEInfoInit =>
  pipe(RTE.ask<ReqInput>(), RTE.chain(applyParams(params)));

const applyParams =
  (params: Params) =>
  (input: ReqInput): RTEInfoInit =>
    pipe(
      normalizeReqInput(input),
      ([info, init]) =>
        pipe(
          getURL(info),
          E.chain(url =>
            // The "weird" merging is due to the mix of the contravariant nature of `Reader`
            // and the function composition at the base of "combinators".
            // Because combinators are applied from right to left, the merging has to be "reversed".
            // This leads to another "weird" behavior for which the url's params provided when `Req` is run
            // win over the ones set with the combinator.
            setParams(merge(new URLSearchParams(params), url.searchParams), url)
          ),
          E.bimap(
            err => toRequestError(err, [info, init]),
            (url): RequestInfoInit => [url.toString(), init]
          )
        ),
      RTE.fromEither
    );

type MaybeURL = E.Either<Error, URL>;

const getURL = (info: RequestInfo): MaybeURL =>
  E.tryCatch(() => new URL(new Request(info).url), E.toError);

const setParams = (params: URLSearchParams, url: URL): MaybeURL =>
  E.tryCatch(() => {
    const u = new URL(url.toString());

    u.search = params.toString();

    return u;
  }, E.toError);

const merge = (
  source: URLSearchParams,
  target: URLSearchParams
): URLSearchParams => {
  const result = new URLSearchParams(source.toString());

  target.forEach((v, k) => {
    result.set(k, v);
  });

  return result;
};
