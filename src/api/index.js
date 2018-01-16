// @flow

import type { Init } from '../request/lib/options';
import type { HeadersConfig } from './lib/headers';

import Maybe from 'data.maybe';
import headers from './lib/headers';
import request from '../request';
import {
  TOKEN_REJECT
} from './constants';

type Config = HeadersConfig & {
  baseUri: string
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
        Maybe.fromNullable(token)
          .map((token: string) => request[key](
            concatStrings(baseUri, uri),
            headers({ version, id, token }, options)
          ))
          .getOrElse(reject(TOKEN_REJECT))
    }), {});

const api = (config: ?Config): Api =>
  Maybe.fromNullable(config)
    .orElse(() => Maybe.of({}))
    .map(compApi)
    .get();


export default api;