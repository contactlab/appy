// @flow

import type { Option } from 'fp-ts/lib/Option.js.flow';

import { fromNullable, some, getOrElseValue } from 'fp-ts/lib/Option';

export type RequestBody = string | URLSearchParams | FormData | Blob | ArrayBuffer | $ArrayBufferView;

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type Init = {
  headers?: {
    [key: string]: string
  },
  body?: RequestBody;
}

type Options = Init & {
  method: Method,
  mode: 'cors'
}

const withMethodAndMode = (method: ?string) => (o: Init): Option<RequestOptions> =>
  fromNullable(method)
    .alt(some('GET'))
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

const evolveBody = (o: RequestOptions): Option<RequestOptions> =>
  fromNullable(o.body)
    .map(body => ({
      ...o,
      body: safeStringify(body)
    }))
    .alt(some(o));


const options = (method: Method) => (o: ?Init): RequestOptions =>
  fromNullable(o)
    .alt(some({}))
    .chain(withMethodAndMode(method))
    .chain(evolveBody)
    .getOrElseValue({});

export default options;