/*tslint:disable:max-classes-per-file*/

/**
 * This module is tailored on the needs of the Contactlab Frontend Team.
 * It uses the "low-level" `request` module in order to interact with Contactlab's services (REST API).
 *
 * So, it is a little more opinionated:
 * - the exposed function (`api`) is used to "load" some configuration and returns an object with methods;
 * - the configuration has a required `baseUri` (string) key which will be prepended to every `uri`;
 * - there are also 2 optional keys `id` (string) and `version` (string) which will be passed as request's `headers`:
 *    * `'Contactlab-ClientId': ${id}`,
 *    * `'Contactlab-ClientVersion': ${version}`;
 * - the configuration is validated and the related error (`ConfigError`) is part of the possible `Left` in the `Task<Either>` returned from the `api` methods;
 * - the main `api` method is `request()` which uses under the hood the `request` module with some subtle differences:
 *    * the `options` parameter is mandatory and it is an extension of the `RequestInit` interface;
 *    * `options` has a required `token` (string) key which will be passed as request's `Authorization: Bearer ${token}` header;
 *    * `options` could have a `decoder` (`Decoder<A>`) optional key which will be used to decode the service's JSON payload (see below for further explanations);
 *    * `headers` in `options` object can only be a map of strings (`{[k: string]: string}`); if you need to work with a `Header` object you have to transform it;
 *    * `options` is merge with a default object in order to set some default values:
 *      - `mode: 'cors'`
 *      - `headers: {'Accept': 'application/json', 'Content-type': 'application/json'}`
 *
 * **About decoding (and validating) api responses:**
 * - when a `decoder: Decoder<A>` key is set in the options object the expected result is a `Task<Either<ApiError, A>>`, because the response payload is decoded with the provided `Decoder`;
 * - when there is not a `decoder` key the expected result is a `Task<Either<ApiError, {message: string}>>`, because the response is always handle as text and put in the objest as-is.
 *
 * References:
 * - https://github.com/gcanti/io-ts
 *
 * @module api
 */

import {Either} from 'fp-ts/lib/Either';
import {Task} from 'fp-ts/lib/Task';
import {Decoder, ValidationError} from 'io-ts';
import {optsToRequestInit} from './opts-to-request-init';
import {AppyError, Method, request as appy} from './request';

export interface HeadersMap {
  [k: string]: string;
}

export interface ApiConfig {
  baseUri: string;
  id?: string;
  version?: string;
}

export class ConfigError {
  public readonly type: 'ConfigError' = 'ConfigError';
  constructor(readonly message: string, readonly config: ApiConfig) {}
}

export class DecoderError {
  public readonly type: 'DecoderError' = 'DecoderError';
  constructor(readonly errors: ValidationError[]) {}
}

export type ApiError = AppyError | ConfigError | DecoderError;

export interface ApiOptionsNoContent extends RequestInit {
  headers?: HeadersMap;
  token: string;
}

export interface ApiOptions<I, A> extends ApiOptionsNoContent {
  decoder: Decoder<I, A>;
}

export interface ApiMessage {
  message: string;
}

export type ApiResponse<A> = Task<Either<ApiError, A>>;

export interface ApiRequest {
  <I, A>(m: Method, u: USVString, o: ApiOptions<I, A>): ApiResponse<A>;
  (m: Method, u: USVString, o: ApiOptionsNoContent): ApiResponse<ApiMessage>;
  <I, A>(
    m: Method,
    u: USVString,
    o: ApiOptionsNoContent | ApiOptions<I, A>
  ): ApiResponse<ApiMessage | A>;
}

export interface ApiRequestImplicitMethod {
  <I, A>(u: USVString, o: ApiOptions<I, A>): ApiResponse<A>;
  (u: USVString, o: ApiOptionsNoContent): ApiResponse<ApiMessage>;
  <I, A>(u: USVString, o: ApiOptionsNoContent | ApiOptions<I, A>): ApiResponse<
    ApiMessage | A
  >;
}

export interface ApiMethods {
  request: ApiRequest;
  get: ApiRequestImplicitMethod;
  post: ApiRequestImplicitMethod;
  put: ApiRequestImplicitMethod;
  patch: ApiRequestImplicitMethod;
  del: ApiRequestImplicitMethod;
}

const fullPath = (a: string, b: string) => `${a}${b}`;

export const request = <I, A>(
  c: ApiConfig,
  m: Method,
  u: USVString,
  o: ApiOptionsNoContent | ApiOptions<I, A>
) => appy(m, fullPath(c.baseUri, u), optsToRequestInit(c, o));

// export const api = (c: ApiConfig): ApiMethods => ({
//   request: (m, u, o) => request(c, m, u, o),
//   get: (u, o) => request(c, 'GET', u, o),
//   post: (u, o) => request(c, 'POST', u, o),
//   put: (u, o) => request(c, 'PUT', u, o),
//   patch: (u, o) => request(c, 'PATCH', u, o),
//   del: (u, o) => request(c, 'DELETE', u, o)
// });
