// @flow

import type { Init } from '../request/lib/options';
import type { HeadersConfig } from './lib/headers';
import type { Option } from 'fp-ts/lib/Option.js.flow';

import { fromNullable, some, getOrElseValue } from 'fp-ts/lib/Option';
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

type Api = {
  ['get' | 'post' | 'put' | 'delete']: (a: string, b: Init) => Promise<*>
}

const concatStrings = (s1: string, s2: string): string => `${s1}${s2}`;

const reject = (message: string) => Promise.reject({
  payload: {
    message
  }
});

const compApi = ({ baseUri, version, id, token }: Config): Api =>
  Object.keys(request)
    .reduce((acc, key) => ({
      ...acc,
      [key]: (uri: string, options: ?Init): Promise<*> =>
        fromNullable(token)
          .map((token: string) => request[key](
            concatStrings(baseUri, uri),
            headers({ version, id, token }, options)
          ))
          .getOrElseValue(reject(TOKEN_REJECT))
    }), {});

const api = (config: ?Config): Api =>
  fromNullable(config)
    .alt(some({
      baseUri: ''
    }))
    .map(compApi)
    .getOrElseValue({})


export default api;