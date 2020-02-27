/**
 * `body` combinator: sets body on a `Req` and returns a `Req`.
 *
 * @since 3.0.0
 */

import * as E from 'fp-ts/lib/Either';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as TU from 'fp-ts/lib/Tuple';
import {pipe} from 'fp-ts/lib/pipeable';
import {Req, ReqInput, normalizeReqInput, toRequestError, Err} from '../index';

/**
 * Sets the provided `body` (automatically converted to string when JSON) on `Req` init object and returns the updated `Req`.
 *
 * @since 3.0.0
 */
export function withBody<A>(body: unknown): (req: Req<A>) => Req<A> {
  return req => pipe(toBodyInit(body), RTE.chain(setBody(req)));
}

function setBody<A>(req: Req<A>): (body: BodyInit) => Req<A> {
  return body =>
    pipe(
      req,
      RTE.local(input =>
        pipe(
          normalizeReqInput(input),
          TU.mapLeft(init => ({...init, body}))
        )
      )
    );
}

function toBodyInit(
  body: unknown
): RTE.ReaderTaskEither<ReqInput, Err, BodyInit> {
  return pipe(
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
}

function toStringWhenJSON(body: unknown): E.Either<Error, BodyInit> {
  if (Object.getPrototypeOf(body).constructor.name !== 'Object') {
    return E.right(body as BodyInit); // type assertion mandatory...
  }

  return E.stringifyJSON(body, E.toError);
}
