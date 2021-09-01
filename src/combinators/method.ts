/**
 * `Method` combinator: sets method on a `Req` and returns a `Req`.
 *
 * **Warning:** the merging logic had to be "reversed" because of the contravariant nature of `Reader` and because the execution of combinators is from right to left (_function composition_).
 *
 * This leads to a "weird" behavior for which the method provided when `Req` is run win over the one set with the combinator.
 *
 * So, for example, if we have:
 * ```ts
 * const request = pipe(appy.request, withMethod('GET'), withMethod('PUT'));
 *
 * request(['http://some.endpoint', {method: 'POST'}])
 * ```
 * when `request` is ran the underlying `fetch` call will be made with `POST` method.
 *
 * @since 4.0.0
 */

import * as RTE from 'fp-ts/ReaderTaskEither';
import * as TU from 'fp-ts/Tuple';
import {pipe} from 'fp-ts/function';
import {Req, normalizeReqInput} from '../request';

/**
 * Sets provided method on `Req` and returns the updated `Req`.
 *
 * @category combinators
 * @since 4.0.0
 */
export function withMethod<A>(method: string): (req: Req<A>) => Req<A> {
  return RTE.local(input =>
    pipe(
      normalizeReqInput(input),
      // The "weird" MERGING is due to the mix of the contravariant nature of `Reader`
      // and the function composition at the base of "combinators".
      // Because combinators are applied from right to left, the merging has to be "reversed".
      // This leads to another "weird" behavior for which the `method` provided when `Req` is run
      // wins over the one set with the combinator.
      TU.mapSnd(init => ({method, ...init}))
    )
  );
}
