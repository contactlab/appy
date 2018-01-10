// @flow

import type { Headers, HeadersConfig } from './headers';
import Maybe from 'data.maybe';
import headers from './headers';
import {
  MODE
} from '../constants';

type OptionsConfig = {
  method: string,
  mode: string,
  headers: HeadersConfig,
  body?: string | Object | any[]
}

export type InitOptionsConfig = {
  mode: string,
  headers: HeadersConfig,
  body?: string | Object | any[]
}

const withHeaders = o => ({
  mode: MODE,
  ...o,
  headers: headers(o.headers)
});

const evolveHeadersAndBody = (o: OptionsConfig): Maybe<RequestOptions> =>
  Maybe.fromNullable(o.body)
    .map(body => ({
      ...withHeaders(o),
      body: JSON.stringify(body)
    }))
    .orElse(() => Maybe.of(withHeaders(o)));

const withMethod = (method: string) => (o: InitOptionsConfig): OptionsConfig => ({
  ...o,
  method
});


export default (method: string = 'GET') => (o: ?InitOptionsConfig): RequestOptions =>
  Maybe.fromNullable(o)
    .orElse(() => Maybe.of({}))
    .chain(evolveHeadersAndBody)
    .map(withMethod(method))
    .get();