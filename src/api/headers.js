// @flow

import type { Option } from 'fp-ts/lib/Option.js.flow';

import { fromNullable, some } from 'fp-ts/lib/Option';
import { Lens } from 'monocle-ts';
import {
  HEADER_ID,
  HEADER_VERSION,
  DEFAULT_HEADERS
} from './constants';

type Headers = {
  [key: string]: string
};

type DefaultHeaders = Headers & {
  'Accept': string,
  'Content-type': string,
  'Authorization': string
};

type CustomHeaders = DefaultHeaders & {
  'Contactlab-ClientId'?: string,
  'Contactlab-ClientVersion'?: string
};

export type HeadersConfig = {
  id?: string,
  version?: string,
  token: string
};

const merge = (o1: Object, o2: Object): Object => Object.assign({}, o1, o2);

const addToken = (t: string) => (h: Headers): DefaultHeaders => 
  Lens.fromNullableProp('Authorization')
    .set(`Bearer ${t}`)(h);

const addCustom = (key: string, value: ?string) => (h: DefaultHeaders): CustomHeaders =>
  fromNullable(value)
    .map(v => 
      Lens.fromNullableProp(key)
        .set(v)(h)
    )
    .getOrElseValue(h);

const customHeaders = ({ id, version, token }) => (o: RequestOptions): Option<RequestOptions> =>
  fromNullable(o.headers)
      .alt(some({}))
      .map(h => merge(DEFAULT_HEADERS, h))
      .map(addToken(token))
      .map(addCustom(HEADER_ID, id))
      .map(addCustom(HEADER_VERSION, version))
      .map(headers => 
        Lens.fromProp('headers')
          .set(headers)(o)  
      );

const headers = (config: HeadersConfig, o: ?RequestOptions): RequestOptions =>
  fromNullable(o)
    .alt(some({}))
    .chain(customHeaders(config))
    .getOrElseValue({});

export default headers;