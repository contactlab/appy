// @flow

import type {NormResponse} from '../request/lib/handle-response';
import type {Req, RequestKey, RequestFn} from '../request';

import { fromNullable } from 'fp-ts/lib/Option';
import { Lens } from 'monocle-ts';
import headers from './lib/headers';
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

type ApiFn = (a: string, b: ?RequestOptions) => Promise<NormResponse | ConfigError>;

const concatStrings = (xs: Array<mixed>): string =>
  xs
    .filter(s => typeof s !== 'undefined' && s !== null)
    .map(String)
    .join('');

const compRequest = (config: Config, fn: RequestFn): ApiFn =>
  fromNullable(config)
    .chain(({baseUri, id, token, version}) => 
      fromNullable(token)
        .map(token => (uri, options) => fn(
          concatStrings([baseUri, uri]),
          headers({ version, id, token }, options)
        ))
    )
    .fold(
      () => () => Promise.reject({error: CONFIG_REJECT}),
      s => s
    );

const compApi = (config: Config): Req<ApiFn> =>
  Object.keys(request)
    .reduce((acc: Object, key: RequestKey) => 
      Lens.fromNullableProp(key)
        .set(compRequest(config, request[key]))(acc),
    {});

export default compApi;