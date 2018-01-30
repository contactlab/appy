// @flow

import type { Method } from './options';
import type { NormResponse } from './handle-response';

import 'isomorphic-fetch';
import options from './options';
import handleResponse from './handle-response';

export type RequestFn = (m: Method, a: string, b: ?RequestOptions) => Promise<NormResponse>;

const request: RequestFn = (method, uri, o) =>
  fetch(uri, options(method)(o))
    .then(handleResponse);

export default request;