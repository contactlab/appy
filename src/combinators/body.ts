/**
 * `body` combinator: sets body on a `Req` and returns a `Req`.
 *
 * **Warning:** the merging logic had to be "reversed" because of the contravariant nature of `Reader` and because the execution of combinators is from right to left (_function composition_).
 *
 * This leads to a "weird" behavior for which the body provided when `Req` is run wins over the one set with the combinator.
 *
 * So, for example, if we have:
 * ```ts
 * const body1 = {id: 123, name: 'foo bar'};
 * const body2 = {id: 456, name: 'baz aaa'};
 *
 * const request = pipe(appy.post, withBody(body1));
 *
 * request(['http://some.endpoint', {body: JSON.stringify(body2)}])
 * ```
 * when `request` is ran the underlying `fetch` call will be made with a `"{'id': 456, 'name': 'baz aaa'}"` body.
 *
 * @since 3.0.0
 */

import * as E from 'fp-ts/Either';
import {stringify} from 'fp-ts/Json';
import * as RTE from 'fp-ts/ReaderTaskEither';
import * as TU from 'fp-ts/Tuple';
import {pipe} from 'fp-ts/function';
import {
  type Req,
  type ReqInput,
  type Err,
  type Combinator,
  normalizeReqInput,
  toRequestError
} from '../request';

/**
 * Sets the provided `body` (automatically converted to string when JSON) on `Req` init object and returns the updated `Req`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const withBody =
  (body: unknown): Combinator =>
  req =>
    pipe(toBodyInit(body), RTE.chain(setBody(req)));

const setBody =
  <A>(req: Req<A>) =>
  (body: BodyInit): Req<A> =>
    pipe(
      req,
      RTE.local(input =>
        pipe(
          normalizeReqInput(input),
          // The "weird" merging is due to the mix of the contravariant nature of `Reader`
          // and the function composition at the base of "combinators".
          // Because combinators are applied from right to left, the merging has to be "reversed".
          // This leads to another "weird" behavior for which the body provided when `Req` is run
          // wins over the one set with the combinator.
          TU.mapSnd(init => Object.assign({}, {body}, init))
        )
      )
    );

const toBodyInit = (
  body: unknown
): RTE.ReaderTaskEither<ReqInput, Err, BodyInit> =>
  pipe(
    RTE.ask<ReqInput>(),
    RTE.chain(input =>
      RTE.fromEither(
        pipe(
          toStringWhenJSON(body),
          E.mapLeft(e => toRequestError(e, normalizeReqInput(input)))
        )
      )
    )
  );

const toStringWhenJSON = (body: unknown): E.Either<Error, BodyInit> => {
  if (Object.getPrototypeOf(body).constructor.name !== 'Object') {
    return E.right(body as BodyInit); // type assertion mandatory...
  }

  return pipe(stringify(body), E.mapLeft(E.toError));
};
