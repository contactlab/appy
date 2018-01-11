// @flow

import type { Headers, HeadersConfig } from './headers';

import Maybe from 'data.maybe';
import headers from './headers';

type Options = Init & {
  method: string,
  mode: 'cors'
}

export type Init = {
  headers: HeadersConfig,
  body?: string | Object | any[]
}

const withHeaders = o => ({
  mode: 'cors',
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