// @flow

import type { RequestBody, Init } from '../../request/lib/options';
import type { Option } from 'fp-ts/lib/Option.js.flow';

import { fromNullable, some, getOrElseValue } from 'fp-ts/lib/Option';
import {
  HEADER_ID,
  HEADER_VERSION,
  DEFAULT_HEADERS
} from '../constants';

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

type CustomInit = {
  body?: RequestBody,
  headers?: CustomHeaders
};

export type HeadersConfig = {
  id?: string,
  version?: string,
  token: string
};

const addDefaults = (t: string) => (h: Headers): DefaultHeaders => ({
  ...DEFAULT_HEADERS,
  ...h,
  'Authorization': `Bearer ${t}`
});

const addCustom = (key: string, value: ?string) => (h: DefaultHeaders): CustomHeaders =>
  fromNullable(value)
    .map(v => ({
      ...h,
      [key]: value
    }))
    .getOrElseValue(h);

const customHeaders = ({
  id,
  version,
  token
  }) => (o: Init): Option<CustomInit> =>
    fromNullable(o.headers)
      .alt(some({}))
      .map(addDefaults(token))
      .map(addCustom(HEADER_ID, id))
      .map(addCustom(HEADER_VERSION, version))
      .map(headers => ({
        ...o,
        headers
      }));

const headers = (config: HeadersConfig, o: ?Init): CustomInit =>
  fromNullable(o)
    .alt(some({}))
    .chain(customHeaders(config))
    .getOrElseValue({});

export default headers;