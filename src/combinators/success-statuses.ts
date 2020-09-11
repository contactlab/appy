/**
 * `SuccessStatuses` combinator: checks `Resp['status']` of a `Req<A>` and returns a `Req<A>`.
 *
 * @since 4.0.0
 */

import * as E from 'fp-ts/lib/Either';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import {pipe} from 'fp-ts/lib/pipeable';
import {Err, Req, Resp, toResponseError} from '../index';

/**
 * Checks `status` to the `Resp<A>` of a `Req`.
 *
 * It returns a `Left<ResponseError>` in case the response is not ok and the
 * status is not included in the `successResponseStatuses` array.
 *
 * @category combinators
 * @since 4.0.0
 */
export function withSuccessStatuses<A>(
  successResponseStatuses: number[]
): (req: Req<A>) => Req<A> {
  return req =>
    pipe(
      req,
      RTE.chain(resp =>
        RTE.fromEither(
          pipe(
            parseResponse(resp, successResponseStatuses),
            E.bimap(
              (e): Err => toResponseError(e, resp.response),
              data => ({...resp, data})
            )
          )
        )
      )
    );
}

function parseResponse<A>(
  {data, response}: Resp<A>,
  successStatuses: number[]
): E.Either<Error, A> {
  const {status} = response;

  if (response.ok || successStatuses.includes(status)) {
    return E.right(data);
  }

  return E.left(new Error(`Request responded with status code ${status}`));
}
