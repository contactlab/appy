/**
 * Utility to convert an `ApiOptions` to a `RequestInit`,
 * appling some defaults value (in case they are not set in the options object):
 * - `mode: 'cors'`,
 * - `headers: {Accept: 'application/json', 'Content-type': 'application/json'}`
 *
 * Other values are computed from `options` and `config` (`ApiConfig`) objects:
 * - `Authentication` header uses the value of `options.token`;
 * - `Contactlab-ClientId` header uses the value of `config.id` if present;
 * - `Contactlab-ClientVersion` header uses the value of `config.version` if present;
 *
 * @module opts-to-request-init
 */

import {fold as foldM} from 'fp-ts/lib/Monoid';
import {fromNullable, getMonoid, some} from 'fp-ts/lib/Option';
import {fold as foldS, getObjectSemigroup} from 'fp-ts/lib/Semigroup';

import {ApiConfig, ApiOptions} from './api';
import {HeadersMap} from './request';

const DEFAULT_MODE: RequestMode = 'cors';
const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-type': 'application/json'
};

const singleton = (k: string) => (v: string): HeadersMap => ({[k]: v});

const foldOHM = foldM(getMonoid(getObjectSemigroup<HeadersMap>()));
const foldRI = foldS(getObjectSemigroup<RequestInit>());

const getHeaders = <A>(config: ApiConfig, opts: ApiOptions<A>): HeadersMap => {
  const optsHeaders = fromNullable(opts.headers);
  const auth = some(opts.token)
    .map(t => `Bearer ${t}`)
    .map(singleton('Authorization'));
  const clientId = fromNullable(config.id).map(
    singleton('Contactlab-ClientId')
  );
  const clientVersion = fromNullable(config.version).map(
    singleton('Contactlab-ClientVersion')
  );

  return foldOHM([
    some(DEFAULT_HEADERS),
    optsHeaders,
    auth,
    clientId,
    clientVersion
  ]).getOrElse(DEFAULT_HEADERS);
};

const getMode = (opts: RequestInit): RequestMode =>
  fromNullable(opts.mode).getOrElse(DEFAULT_MODE);

// TODO: find a more robust, "typescript-supported" solution...
const toRequestInit = <A>(otps: ApiOptions<A>): RequestInit => {
  const result = Object.assign({}, otps);

  delete result.token;
  delete result.decoder;

  return result;
};

export const optsToRequestInit = <A>(
  config: ApiConfig,
  opts: ApiOptions<A>
): RequestInit =>
  foldRI(toRequestInit(opts))([
    {headers: getHeaders(config, opts)},
    {mode: getMode(opts)}
  ]);
