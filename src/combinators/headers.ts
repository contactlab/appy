/**
 * `Headers` combinator: sets headers on a `Req` and returns a `Req`.
 *
 * @since 3.0.0
 */

import {sequenceT} from 'fp-ts/lib/Apply';
import * as E from 'fp-ts/lib/Either';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as TU from 'fp-ts/lib/Tuple';
import {pipe} from 'fp-ts/lib/pipeable';
import {Req, normalizeReqInput, ReqInput, Err, toRequestError} from '../index';

const EMPTY: Headers = new Headers();

const sequenceTEither = sequenceT(E.either);

/**
 * Merges provided `Headers` with `Req` ones and returns the updated `Req`.
 *
 * @since 3.0.0
 */
export function withHeaders<A>(headers: HeadersInit): (req: Req<A>) => Req<A> {
  return req => pipe(merge(headers), RTE.chain(setHeaders(req)));
}

function merge(h: HeadersInit): RTE.ReaderTaskEither<ReqInput, Err, Headers> {
  return pipe(
    RTE.ask<ReqInput>(),
    RTE.map(normalizeReqInput),
    RTE.chain(input =>
      RTE.fromEither(
        pipe(
          sequenceTEither(toHeaders(input[1].headers || EMPTY), toHeaders(h)),
          E.bimap(
            e => toRequestError(e, input),
            hs => concat(...hs)
          )
        )
      )
    )
  );
}

function toHeaders(h: HeadersInit): E.Either<Error, Headers> {
  return E.tryCatch(() => new Headers(h), E.toError);
}

function concat(x: Headers, y: Headers): Headers {
  const result = new Headers(x);

  y.forEach((v, k) => {
    result.set(k, v);
  });

  return result;
}

function setHeaders<A>(req: Req<A>): (headers: Headers) => Req<A> {
  return headers =>
    pipe(
      req,
      RTE.local(input =>
        pipe(
          normalizeReqInput(input),
          TU.mapLeft(init => ({...init, headers}))
        )
      )
    );
}
