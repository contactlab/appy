// @flow

import 'whatwg-fetch';
import options from './lib/options';

const withMethod = (method: string, o: ConfigOptions) => ({
  ...o,
  method
});

const f = (method: string) => (uri: string, o: ConfigOptions): Promise < Object > => {
  fetch(uri, options(withMethod(method, o)));
};

export default {
  get: f('GET'),
  post: f('POST'),
  put: f('PUT'),
  delete: f('DELETE')
}