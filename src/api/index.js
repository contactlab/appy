// @flow

import type { Init } from '../request/lib/options';
import request from '../request';

type Config = {
  baseUri: string,
  options?: Init
};

type Api = {
  [string]: string => Promise<Object>
}

const concatStrings = (s1: string, s2: string): string => `${s1}${s2}`;

const api = ({ baseUri, options }: Config): Api =>
  Object.keys(request)
    .reduce((acc, key) => ({
      ...acc,
      [key]: uri => request[key](concatStrings(baseUri, uri), options)
    }), {});

export default api;