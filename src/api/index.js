// @flow

import type {NormResponse} from '../request/handle-response';
import type {Method} from '../request/options';

import { fromNullable } from 'fp-ts/lib/Option';
import headers from './headers';
import request from '../request';
import {
  CONFIG_REJECT
} from './constants';

type Config = {|
  baseUri: string,
  id?: string,
  version?: string,
  token: string
|};

type ConfigError = {|
  error: string
|};

type ApiFn = (m: Method, a: string, b: ?RequestOptions) => Promise<NormResponse | ConfigError>;

const concatStrings = (xs: Array<mixed>): string =>
  xs
    .filter(s => typeof s !== 'undefined' && s !== null)
    .map(String)
    .join('');

const compRequest = ({baseUri, id, token, version}) =>
  fromNullable(token)
    .map(token => (method, uri, options) =>
      request(
        method,
        concatStrings([baseUri, uri]),
        headers({ version, id, token }, options)
      )
    );

const api = (config: Config): ApiFn =>
  fromNullable(config)
    .chain(compRequest)
    .fold(
      () => () => Promise.reject({error: CONFIG_REJECT}),
      s => s
    );

export default api;