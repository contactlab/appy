// @flow

import type { Headers, HeadersConfig } from './headers';

import Maybe from 'data.maybe';
import headers from './headers';
import {
  MODE
} from '../constants';

type Options = Init & {
  method: string
}

export type Init = {
  method?: string,
  mode: string,
  headers: HeadersConfig,
  body?: string | Object | any[]
}

const withHeaders = o => ({
  mode: MODE,
  ...o,
  headers: headers(o.headers)
});

const evolveHeadersAndBody = (o: Options): Maybe<RequestOptions> =>
  Maybe.fromNullable(o.body)
    .map(body => ({
      ...withHeaders(o),
      body: JSON.stringify(body)
    }))
    .orElse(() => Maybe.of(withHeaders(o)));

const withMethod = (method: ?string) => (o: Init): Options => 
  Maybe.fromNullable(method)
    .map(m => ({
      ...o,
      method
    }))
    .getOrElse({
      ...o,
      method: 'GET'
    });


export default (method: ?string) => (o: ?Init): RequestOptions =>
  Maybe.fromNullable(o)
    .orElse(() => Maybe.of({}))
    .chain(evolveHeadersAndBody)
    .map(withMethod(method))
    .get();