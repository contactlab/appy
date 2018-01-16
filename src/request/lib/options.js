// @flow

import Maybe from 'data.maybe';

type RequestBody = string | URLSearchParams | FormData | Blob | ArrayBuffer | $ArrayBufferView;

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type Init = {
  headers: Object,
  body?: RequestBody;
}

type Options = Init & {
  method: Method,
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

const safeStringify = (x: RequestBody): string => {
  try {
    return JSON.stringify(x)
  } catch (e) {
    return '';
  }
};

const evolveBody = (o: Options): Maybe<RequestOptions> =>
  Maybe.fromNullable(o.body)
    .map(body => ({
      ...o,
      body: safeStringify(body)
    }))
    .orElse(() => Maybe.of(o));


const options = (method: Method) => (o: ?Init): RequestOptions =>
  Maybe.fromNullable(o)
    .orElse(() => Maybe.of({}))
    .chain(withMethodAndMode(method))
    .chain(evolveBody)
    .get();

export default options;