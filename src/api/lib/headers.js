// @flow

import type { Init } from '../../request/lib/options';

import Maybe from 'data.maybe';
import {
  HEADER_ID,
  HEADER_VERSION
} from '../constants';

type Headers = {
  [key: string]: string
};

type TokenHeader = Headers & {
  'Authorization': string
}

type CustomHeaders = TokenHeader & {
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

const addToken = (t: string) => (h: Headers): TokenHeader => ({
  ...h,
  'Authorization': `Bearer ${t}`
});

const addCustom = (key: string, value: ?string) => (h: TokenHeader): CustomHeaders =>
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
      .map(addToken(token))
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