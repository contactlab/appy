// @flow

import type { Option } from 'fp-ts/lib/Option.js.flow';

import { fromNullable, some, getOrElseValue } from 'fp-ts/lib/Option';
import { Lens } from 'monocle-ts'

export type RequestBody = string | URLSearchParams | FormData | Blob | ArrayBuffer | $ArrayBufferView;

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

const secureMethod = (method: ?string) => (o: RequestOptions): Option<RequestOptions> =>
  fromNullable(method)
    .alt(some('GET'))
    .map(method => 
      Lens.fromProp('method')
        .set(method)(o)
    );

const secureMode = (o: RequestOptions): Option<RequestOptions> =>
  fromNullable(o.mode)
    .alt(some('cors'))
    .map(mode =>
      Lens.fromNullableProp('mode')
        .set(mode)(o)
    );

const safeStringify = (x: any): string => {
  try {
    return JSON.stringify(x)
  } catch (e) {
    return '';
  }
};

const evolveBody = (o: RequestOptions): Option<RequestOptions> =>
  fromNullable(o.body)
    .map(() => 
      Lens.fromProp('body')
        .modify(safeStringify)(o)
    )
    .alt(some(o));


const options = (method: Method) => (o: ?RequestOptions): RequestOptions =>
  fromNullable(o)
    .alt(some({}))
    .chain(secureMethod(method))
    .chain(secureMode)
    .chain(evolveBody)
    .getOrElseValue({});

export default options;