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
 * - the main `api` method is `request()` which uses under the hood the `request` module with some subtle differences:
 *    * the `options` parameter is mandatory and it is an extension of the `RequestInit` interface;
 *    * `options` has a required `token` (string) key which will be passed as request's `Authorization: Bearer ${token}` header;
 *    * `options` has a require `decoder` (`Decoder<I, A>`) key which will be used to decode the service's JSON payload;
 *    * decoder errors are expressed with a `DecoderError` class which extends the `AppyError` tagged union type into as `ApiError`;
 *    * thus, the returned type of `api` methods is `Task<Either<ApiError, A>>`
 *    * `headers` in `options` object can only be a map of strings (`{[k: string]: string}`); if you need to work with a `Header` object you have to transform it;
 *    * `options` is merged with a predefined object in order to set some default values:
 *      - `mode: 'cors'`
 *      - `headers: {'Accept': 'application/json', 'Content-type': 'application/json'}`
 *
 * References:
 * - https://github.com/gcanti/io-ts
 *
 * @module api
 */

import {Either} from 'fp-ts/lib/Either';
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
  token: string;
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
  request(m, fullPath(c.baseUri, u), optsToRequestInit(c, o)).map(result =>
    result
      .mapLeft<ApiError>(identity) // type-level mapping... ;)
      .chain(b => applyDecoder(b, o.decoder))
  );

export const api = (c: ApiConfig): ApiMethods => ({
  request: (method, uri, options) => makeRequest(c, method, uri, options),
  get: (uri, options) => makeRequest(c, 'GET', uri, options),
  post: (uri, options) => makeRequest(c, 'POST', uri, options),
  put: (uri, options) => makeRequest(c, 'PUT', uri, options),
  patch: (uri, options) => makeRequest(c, 'PATCH', uri, options),
  del: (uri, options) => makeRequest(c, 'DELETE', uri, options)
});
