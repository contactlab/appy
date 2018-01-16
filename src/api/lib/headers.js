// @flow

import type { Init } from '../../request/lib/options';

import Maybe from 'data.maybe';
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
}

type CustomHeaders = DefaultHeaders & {
  'Contactlab-ClientId'?: string,
  'Contactlab-ClientVersion'?: string
};

type CustomInit = Init & {
  headers: CustomHeaders
};

export type HeadersConfig = {
  id?: string,
  version?: string,
  token: string
}

const addDefaults = (t: string) => (h: Headers): DefaultHeaders => ({
  ...DEFAULT_HEADERS,
  ...h,
  'Authorization': `Bearer ${t}`
});

const addCustom = (key: string, value: ?string) => (h: DefaultHeaders): CustomHeaders =>
  Maybe.fromNullable(value)
    .map(v => ({
      ...h,
      [key]: value
    }))
    .getOrElse(h);

const customHeaders = ({
  id,
  version,
  token
  }) => (o: Init): CustomInit =>
    Maybe.fromNullable(o.headers)
      .orElse(() => Maybe.of({}))
      .map(addDefaults(token))
      .map(addCustom(HEADER_ID, id))
      .map(addCustom(HEADER_VERSION, version))
      .map(headers => ({
        ...o,
        headers
      }));

const headers = (config: HeadersConfig, o: ?Init): CustomInit =>
  Maybe.fromNullable(o)
    .orElse(() => Maybe.of({}))
    .chain(customHeaders(config))
    .get();

export default headers;