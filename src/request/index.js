// @flow

import type { Init } from './lib/options';
import type { NormResponse } from './lib/handle-response';

import 'isomorphic-fetch';
import options from './lib/options';
import handleResponse from './lib/handle-response';

const f = (method: string) => {
  const opts = options(method);
  return (uri: string, o: ?Init): Promise<NormResponse> =>
    fetch(uri, opts(o))
      .then(handleResponse)
}

export default {
  get: f('GET'),
  post: f('POST'),
  put: f('PUT'),
  delete: f('DELETE')
};