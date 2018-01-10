// @flow

import 'isomorphic-fetch';
import type { InitOptionsConfig } from './lib/options';
import type { NormalizedResponse } from './lib/handle-response';
import options from './lib/options';
import handleResponse from './lib/handle-response';

const f = (method: string) => {
  const opts = options(method);
  return (uri: string, o: ?InitOptionsConfig): Promise<NormalizedResponse> =>
    fetch(uri, opts(o))
      .then(handleResponse)
}

export default {
  get: f('GET'),
  post: f('POST'),
  put: f('PUT'),
  delete: f('DELETE')
};