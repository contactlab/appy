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
 * @since 1.0.0
 */

import {fold as foldM} from 'fp-ts/lib/Monoid';
import {
  fromNullable,
  getMonoid,
  getOrElse,
  map,
  option,
  some
} from 'fp-ts/lib/Option';
import {fold as foldS, getObjectSemigroup} from 'fp-ts/lib/Semigroup';
import {pipe} from 'fp-ts/lib/pipeable';
import {ApiConfig, ApiOptions} from './api';
import {HeadersMap} from './request';

const CLIENT_ID = 'Contactlab-ClientId';
const CLIENT_VERSION = 'Contactlab-ClientVersion';
const DEFAULT_MODE: RequestMode = 'cors';
const DEFAULT_HEADERS: HeadersMap = {
  Accept: 'application/json',
  'Content-type': 'application/json'
};

const foldOHM = foldM(getMonoid(getObjectSemigroup<HeadersMap>()));
const foldRI = foldS(getObjectSemigroup<RequestInit>());
const singleton = (k: string) => (v: string): HeadersMap => ({[k]: v});

export const optsToRequestInit = <A>(
  config: ApiConfig,
  opts: ApiOptions<A>
): RequestInit =>
  foldRI(toRequestInit(opts), [
    {headers: getHeaders(config, opts)},
    {mode: getMode(opts)}
  ]);

// --- Helpers
function getHeaders<A>(
  {id, version}: ApiConfig,
  opts: ApiOptions<A>
): HeadersMap {
  const headers = fromNullable(opts.headers);
  const auth = pipe(
    some(opts.token),
    map(t => `Bearer ${t}`),
    map(singleton('Authorization'))
  );
  const clientId = option.map(fromNullable(id), singleton(CLIENT_ID));
  const clientVersion = option.map(
    fromNullable(version),
    singleton(CLIENT_VERSION)
  );

  return pipe(
    foldOHM([some(DEFAULT_HEADERS), headers, auth, clientId, clientVersion]),
    getOrElse(
      /* istanbul ignore next */
      () => DEFAULT_HEADERS
    )
  );
}

function getMode(opts: RequestInit): RequestMode {
  return typeof opts.mode !== 'undefined' ? opts.mode : DEFAULT_MODE;
}

function toRequestInit<A>(opts: ApiOptions<A>): RequestInit {
  const result = {...opts};

  delete result.token;
  delete result.decoder;

  return result;
}
