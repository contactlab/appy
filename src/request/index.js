// @flow

import 'whatwg-fetch';
import options from './lib/options';
import handleResponse from './lib/handle-response';
import {
  METHOD_GET,
  METHOD_POST,
  METHOD_PUT,
  METHOD_DELETE
} from './constants';

const f = (method: string) => {
  const opts = options(method);
  return (uri: string, o: ?InitOptionsConfig): Promise<NormalizedResponse> =>
    fetch(uri, opts(o))
      .then(handleResponse)
}

export default {
  get: f(METHOD_GET),
  post: f(METHOD_POST),
  put: f(METHOD_PUT),
  delete: f(METHOD_DELETE)
};