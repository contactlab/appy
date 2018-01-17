// @flow

import type { HeadersConfig } from './lib/headers';
import type { Option } from 'fp-ts/lib/Option.js.flow';

import { fromNullable, some, getOrElseValue } from 'fp-ts/lib/Option';
import { Lens } from 'monocle-ts'
import headers from './lib/headers';
import request from '../request';
import {
  TOKEN_REJECT
} from './constants';

type Config = {
  baseUri: string,
  id?: string,
  version?: string,
  token?: string
};

type ApiKey = 'get' | 'post' | 'put' | 'delete';
type ApiFn = (a: string, b: ?RequestOptions) => Promise<*>;
type Api = {
  [ApiKey]: ApiFn
}

const concatStrings = (s1: string, s2: string): string => `${s1}${s2}`;

const compRequest = ({ baseUri, version, id, token }: Config) => (r): ApiFn =>
  (uri, options) =>
    fromNullable(token)
      .map(token => r(
        concatStrings(baseUri, uri),
        headers({ version, id, token }, options)
      ))
      .fold(
        n => 
          new Promise(() => {
            throw TOKEN_REJECT
          }),
        s => s
      );

const compApi = (config: Config): Api =>
  Object.keys(request)
    .reduce((acc, key) => 
      Lens.fromProp(key)
        .modify(compRequest(config))(acc),
      request);

const api = (config: ?Config): Api =>
  fromNullable(config)
    .alt(some({
      baseUri: ''
    }))
    .map(compApi)
    .getOrElseValue({})

export default api;