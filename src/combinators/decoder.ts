/**
 * `Decoder` combinator: decodes `Resp` of a `Req<A>` and returns a `Req<B>`.
 *
 * @since 3.0.0
 */

import * as E from 'fp-ts/lib/Either';
import {ReaderEither, mapLeft} from 'fp-ts/lib/ReaderEither';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import {pipe} from 'fp-ts/lib/pipeable';
import {Err, Req, Resp, toResponseError} from '../index';
import {withHeaders} from './headers';

/**
 * Encodes a generic decoder, namely a function which takes an `unknown` input (usually a JSON object) and tries to decode it, returning a `Right<A>` if it succeeds or a `Left<E>` otherwise.
 *
 * @category Decoder
 * @since 3.0.0
 */
export interface GenericDecoder<E, A> extends ReaderEither<unknown, E, A> {}

/**
 * A specialization of a `GenericDecoder` with `Left` type fixed to `Error`.
 *
 * @category Decoder
 * @since 3.0.0
 */
export interface Decoder<A> extends GenericDecoder<Error, A> {}

/**
 * Applies `Decoder<B>` to the `Resp<A>` of a `Req` converting it to a `Resp<B>`.
 *
 * It returns a `Left<ResponseError>` in case the decoding fails.
 *
 * It automatically sets "JSON" request header's
 *
 * @category combinators
 * @since 4.0.0
 */
export function withDecoder<A, B extends {data: unknown; status: number}>(
  decoder: Decoder<B>
): (req: Req<A>) => Req<B> {
  return req =>
    pipe(
      req,
      withHeaders({
        Accept: 'application/json',
        'Content-type': 'application/json'
      }),
      RTE.chain(resp =>
        RTE.fromEither(
          pipe(
            parseResponse(resp),
            E.chain(decoder),
            E.bimap(
              (e): Err => toResponseError(e, resp.response),
              data => ({...resp, data})
            )
          )
        )
      )
    );
}

/**
 * Converts a `GenericDecoder<E, A>` into a `Decoder<A>`.
 *
 * @category helpers
 * @since 3.0.0
 */
export function toDecoder<E, A>(
  dec: GenericDecoder<E, A>,
  onLeft: (e: E) => Error
): Decoder<A> {
  return pipe(dec, mapLeft(onLeft));
}

function parseResponse<A>({
  data,
  response: {status}
}: Resp<A>): E.Either<Error, unknown> {
  if (typeof data === 'object') {
    return E.right({data, status});
  }

  const asString = String(data);
  const prepared = asString.length === 0 ? '{}' : asString;

  return E.parseJSON(prepared, E.toError);
}
