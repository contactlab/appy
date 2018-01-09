// @flow

import Maybe from 'data.maybe';
import headers from './headers';
import {
  MODE,
  METHOD_GET
} from '../constants';

const DEFAULTS = {
  method: METHOD_GET,
  mode: MODE
};

const withHeaders = o => ({
  ...DEFAULTS,
  ...o,
  headers: headers(o.headers)
});

const evolveHeadersAndBody = (o: OptionsConfig): Maybe < RequestOptions > =>
  Maybe.fromNullable(o.body)
  .map(body => ({
    ...withHeaders(o),
    body: JSON.stringify(body)
  }))
  .orElse(() => Maybe.of(withHeaders(o)));


export default (o: OptionsConfig): RequestOptions =>
  Maybe.fromNullable(o)
  .orElse(() => Maybe.of({}))
  .chain(evolveHeadersAndBody)
  .get();