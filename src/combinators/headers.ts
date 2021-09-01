/**
 * `Headers` combinator: sets headers on a `Req` and returns a `Req`.
 *
 * **Warning:** the merging logic had to be "reversed" because of the contravariant nature of `Reader` and because the execution of combinators is from right to left (_function composition_).
 *
 * This leads to a "weird" behavior for which the headers provided when `Req` is run win over the ones set with the combinator.
 *
 * So, for example, if we have:
 * ```ts
 * const request = pipe(appy.get, withHeaders({'X-Foo': 'bar'}), withHeaders({'X-Foo': 'baz'}));
 *
 * request(['http://some.endpoint', {headers: {'X-Foo': 'foo'}}])
 * ```
 * when `request` is ran the underlying `fetch` call will be made with a `X-Foo = 'foo'` header.
 *
 * @since 3.0.0
 */

import * as RTE from 'fp-ts/ReaderTaskEither';
import {getMonoid} from 'fp-ts/Record';
import {last} from 'fp-ts/Semigroup';
import * as TU from 'fp-ts/Tuple';
import {pipe} from 'fp-ts/function';
import {Req, normalizeReqInput} from '../request';

type Hs = Record<string, string>;

const RML = getMonoid(last<string>());

/**
 * Merges provided `Headers` with `Req` ones and returns the updated `Req`.
 *
 * @category combinators
 * @since 3.0.0
 */
export function withHeaders<A>(headers: HeadersInit): (req: Req<A>) => Req<A> {
  return RTE.local(input =>
    pipe(
      normalizeReqInput(input),
      TU.mapSnd(init => merge(init, headers))
    )
  );
}

function merge(init: RequestInit, h: HeadersInit): RequestInit {
  // The "weird" `concat` is due to the mix of the contravariant nature of `Reader`
  // and the function composition at the base of "combinators".
  // Because combinators are applied from right to left, the merging has to be "reversed".
  // This leads to another "weird" behavior for which the `Headers` provided when `Req` is run
  // wins over the ones set with the combinator.
  const headers =
    typeof init.headers === 'undefined' ? toRecord(h) : concat(h, init.headers);

  return {...init, headers};
}

function concat(a: HeadersInit, b: HeadersInit): Hs {
  return RML.concat(toRecord(a), toRecord(b));
}

function toRecord(h: HeadersInit): Hs {
  if (Array.isArray(h)) {
    return h.reduce((acc, [k, v]) => ({...acc, [k]: v}), {});
  }

  if (h instanceof Headers) {
    const result: Hs = {};

    h.forEach((v, k) => (result[k] = v));

    return result;
  }

  return h;
}
