/**
 * `Decoder` combinator: decodes `Resp` of a `Req<A>` and returns a `Req<B>`.
 *
 * @since 3.0.0
 */

import * as E from 'fp-ts/Either';
import {parse} from 'fp-ts/Json';
import {ReaderEither, mapLeft} from 'fp-ts/ReaderEither';
import * as RTE from 'fp-ts/ReaderTaskEither';
import {pipe} from 'fp-ts/function';
import {type Err, type Req, type Resp, toResponseError} from '../request';
import {cloneResponse} from '../response';
import {withHeaders} from './headers';

/**
 * Encodes a generic decoder, namely a function which takes an `unknown` input (usually a JSON object) and tries to decode it, returning a `Right<A>` if it succeeds or a `Left<L>` otherwise.
 *
 * @category Decoder
 * @since 3.0.0
 */
export interface GenericDecoder<L, A> extends ReaderEither<unknown, L, A> {}

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
 * @since 3.0.0
 */
export const withDecoder =
  <B>(decoder: Decoder<B>) =>
  <A>(req: Req<A>): Req<B> =>
    pipe(
      req,
      withHeaders({Accept: 'application/json'}),
      RTE.chain(resp =>
        RTE.fromEither(
          pipe(
            parseResponse(resp),
            E.chain(decoder),
            E.bimap(
              (e): Err =>
                toResponseError(e, cloneResponse(resp.response, resp.data)),
              data => ({...resp, data})
            )
          )
        )
      )
    );

/**
 * Converts a `GenericDecoder<L, A>` into a `Decoder<A>`.
 *
 * @category helpers
 * @since 3.0.0
 */
export const toDecoder = <L, A>(
  dec: GenericDecoder<L, A>,
  onLeft: (e: L) => Error
): Decoder<A> => pipe(dec, mapLeft(onLeft));

const parseResponse = <A>({data}: Resp<A>): E.Either<Error, unknown> => {
  if (typeof data === 'object') {
    return E.right(data);
  }

  const asString = String(data);
  const prepared = asString.length === 0 ? '{}' : asString;

  return pipe(parse(prepared), E.mapLeft(E.toError));
};
