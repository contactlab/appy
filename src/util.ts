import * as t from './types';

/**
 * Creates a `RequestError` object.
 *
 * @category Error
 * @since 3.0.0
 */
export function toRequestError(
  error: Error,
  input: t.RequestInfoInit
): t.RequestError {
  return {type: 'RequestError', error, input};
}

/**
 * Creates a `ResponseError` object.
 *
 * @category Error
 * @since 3.0.0
 */
export function toResponseError(
  error: Error,
  response: Response
): t.ResponseError {
  return {type: 'ResponseError', response, error};
}

/**
 * Normalizes the input of a `Req` to a `RequestInfoInit` tuple even when only a single `RequestInfo` is provided.
 *
 * @category Request
 * @since 3.0.0
 */
export function normalizeReqInput(input: t.ReqInput): t.RequestInfoInit {
  return Array.isArray(input) ? input : [input, {}];
}
