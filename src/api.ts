/*tslint:disable:max-classes-per-file*/

/**
 * @module api
 * @since 1.0.0
 * @see {@link https://github.com/gcanti/io-ts|io-ts}
 */

import {Either} from 'fp-ts/lib/Either';
import {fromEither} from 'fp-ts/lib/TaskEither';
import {identity} from 'fp-ts/lib/function';
import {Decoder, ValidationError} from 'io-ts';
import {optsToRequestInit} from './opts-to-request-init';
import {
  AppyError,
  AppyResponse,
  AppyTask,
  HeadersMap,
  Method,
  Mixed,
  request
} from './request';

export interface ApiConfig {
  baseUri: string;
  id?: string;
  version?: string;
}

export interface ApiMethods {
  request: ApiRequest;
  get: ApiRequestNoMethod;
  post: ApiRequestNoMethod;
  put: ApiRequestNoMethod;
  patch: ApiRequestNoMethod;
  del: ApiRequestNoMethod;
}

export interface ApiRequest {
  <A>(m: Method, u: USVString, o: ApiOptions<A>): ApiTask<A>;
}

export interface ApiRequestNoMethod {
  <A>(u: USVString, o: ApiOptions<A>): ApiTask<A>;
}

export interface ApiOptions<A> extends RequestInit {
  headers?: HeadersMap;
  token?: string;
  decoder: Decoder<Mixed, A>;
}

export type ApiTask<A> = AppyTask<ApiError, A>;

export type ApiError = AppyError | DecoderError;

export class DecoderError {
  public readonly type: 'DecoderError' = 'DecoderError';
  constructor(readonly errors: ValidationError[]) {}
}

const fullPath = (a: string, b: string) => `${a}${b}`;

const applyDecoder = <A>(
  aresponse: AppyResponse<Mixed>,
  decoder: Decoder<Mixed, A>
): Either<ApiError, AppyResponse<A>> =>
  decoder
    .decode(aresponse.body)
    .bimap(err => new DecoderError(err), body => ({...aresponse, body}));

const makeRequest = <A>(
  c: ApiConfig,
  m: Method,
  u: USVString,
  o: ApiOptions<A>
): ApiTask<A> =>
  request(m, fullPath(c.baseUri, u), optsToRequestInit(c, o))
    .mapLeft<ApiError>(identity) // type-level mapping... ;)
    .chain(b => fromEither(applyDecoder(b, o.decoder)));

export const api = (c: ApiConfig): ApiMethods => ({
  request: (method, uri, options) => makeRequest(c, method, uri, options),
  get: (uri, options) => makeRequest(c, 'GET', uri, options),
  post: (uri, options) => makeRequest(c, 'POST', uri, options),
  put: (uri, options) => makeRequest(c, 'PUT', uri, options),
  patch: (uri, options) => makeRequest(c, 'PATCH', uri, options),
  del: (uri, options) => makeRequest(c, 'DELETE', uri, options)
});
