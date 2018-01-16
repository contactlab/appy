// @flow

import type { Init } from './lib/options';
import type { NormResponse } from './lib/handle-response';

import 'isomorphic-fetch';
import options from './lib/options';
import handleResponse from './lib/handle-response';

const f = (method: string) => 
  (uri: string, o: ?Init): Promise<NormResponse> =>
    fetch(uri, options(method)(o))
      .then(handleResponse);

const request = {
  get: f('GET'),
  post: f('POST'),
  put: f('PUT'),
  delete: f('DELETE')
};

export default request;