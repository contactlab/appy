// @flow

import 'whatwg-fetch';
import options from './lib/options';
import {
  METHOD_GET,
  METHOD_POST,
  METHOD_PUT,
  METHOD_DELETE
} from './constants';

const withMethod = (method: string, o: OptionsConfig): OptionsConfig => ({
  ...o,
  method
});

const f = (method: string) => (uri: string, o: OptionsConfig): Promise < Object > =>
  fetch(uri, options(withMethod(method, o)));

export default {
  get: f(METHOD_GET),
  post: f(METHOD_POST),
  put: f(METHOD_PUT),
  delete: f(METHOD_DELETE)
}