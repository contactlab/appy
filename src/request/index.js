// @flow

import 'whatwg-fetch';
import options from './lib/options';

const withMethod = (method: string, o: OptionsConfig): OptionsConfig => ({
  ...o,
  method
});

const f = (method: string) => (uri: string, o: OptionsConfig): Promise < Object > =>
  fetch(uri, options(withMethod(method, o)));

export default {
  get: f('GET'),
  post: f('POST'),
  put: f('PUT'),
  delete: f('DELETE')
}