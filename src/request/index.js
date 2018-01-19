// @flow

import type { Method } from './options';
import type { NormResponse } from './handle-response';

import 'isomorphic-fetch';
import options from './options';
import handleResponse from './handle-response';

export type RequestKey = 'get' | 'post' | 'put' | 'delete';
export type RequestFn = (a: string, b: ?RequestOptions) => Promise<NormResponse>;
export type Req<T> = {
  [RequestKey]: T
};

const f = (method: Method): RequestFn =>
  (uri, o): Promise<NormResponse> =>
    fetch(uri, options(method)(o))
      .then(handleResponse);

const request: Req<RequestFn> = {
  get: f('GET'),
  post: f('POST'),
  put: f('PUT'),
  delete: f('DELETE')
};

export default request;