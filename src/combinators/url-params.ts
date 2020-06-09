/**
 * `URLSearchParams` combinator: sets query parameters to `Req`'s url and returns a `Req`.
 *
 * @since 3.0.0
 */

import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as TU from 'fp-ts/lib/Tuple';
import {pipe} from 'fp-ts/lib/pipeable';
import {Req, ReqInput, RequestInfoInit, normalizeReqInput} from '../index';

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
        const p = merge(url.searchParams, urlParams);

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
