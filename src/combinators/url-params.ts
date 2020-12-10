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

import * as RTE from 'fp-ts/ReaderTaskEither';
import * as TU from 'fp-ts/Tuple';
import {pipe} from 'fp-ts/function';
import {Req, ReqInput, RequestInfoInit, normalizeReqInput} from '../request';

/**
 * Adds provided url search parameters (as `Record<string, string>`) to `Req`'s input url and returns the updated `Req`.
 *
 * @category combinators
 * @since 3.0.0
 */
export function withUrlParams<A>(
  params: Record<string, string>
): (req: Req<A>) => Req<A> {
  return RTE.local(setURLParams(params));
}

function setURLParams(
  params: Record<string, string>
): (input: ReqInput) => RequestInfoInit {
  const urlParams = new URLSearchParams(params);

  return input =>
    pipe(
      normalizeReqInput(input),
      TU.map(info => {
        const url = getURL(info);
        // The "weird" merging is due to the mix of the contravariant nature of `Reader`
        // and the function composition at the base of "combinators".
        // Because combinators are applied from right to left, the merging has to be "reversed".
        // This leads to another "weird" behavior for which the url's params provided when `Req` is run
        // win over the ones set with the combinator.
        const p = merge(urlParams, url.searchParams);

        return setParams(p, url).toString();
      })
    );
}

function getURL(info: RequestInfo): URL {
  return new URL(new Request(info).url);
}

function merge(
  source: URLSearchParams,
  target: URLSearchParams
): URLSearchParams {
  const result = new URLSearchParams(source.toString());

  target.forEach((v, k) => {
    result.set(k, v);
  });

  return result;
}

function setParams(params: URLSearchParams, url: URL): URL {
  const u = new URL(url.toString());

  u.search = params.toString();

  return u;
}
