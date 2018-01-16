// @flow

import Maybe from 'data.maybe';

export type Init = {
  headers: Object,
  body?: string | Object | any[]
}

type Options = Init & {
  method: string,
  mode: 'cors'
}

const withMethodAndMode = (method: ?string) => (o: Init): Maybe<RequestOptions> => 
  Maybe.fromNullable(method)
    .orElse(() => Maybe.of('GET'))
    .map(method => ({
      mode: 'cors',
      ...o,
      method
    }));

const evolveBody = (o: Options): Maybe<RequestOptions> =>
  Maybe.fromNullable(o.body)
    .map(body => ({
      ...o,
      body: JSON.stringify(body)
    }))
    .orElse(() => Maybe.of(o));

const secureHeaders = (o: Options): Maybe<RequestOptions> =>
  Maybe.fromNullable(o.headers)
    .orElse(() => Maybe.of({}))
    .map(h => ({
      'Accept': 'application/json',
      'Content-type': 'application/json',    
      ...h
    }))
    .map(headers => ({
      ...o,
      headers
    }));



const options = (method: string) => (o: ?Init): RequestOptions =>
  Maybe.fromNullable(o)
    .orElse(() => Maybe.of({}))
    .chain(withMethodAndMode(method))
    .chain(evolveBody)
    .chain(secureHeaders)
    .get();

export default options;