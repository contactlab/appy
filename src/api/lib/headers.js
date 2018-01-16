// @flow

import Maybe from 'data.maybe';
import {
  HEADERS,
  HEADER_ID,
  HEADER_VERSION
} from '../constants';

type CustomHeaders = {
  'Contactlab-ClientId'?: string,
  'Contactlab-ClientVersion'?: string,
  'Authorization'?: string
};

type Headers = {};

export type HeadersConfig = {
  id?: string,
  version?: string,
  token?: string,
  custom?: Object
}

const simpleHeader = (key: string, value: ?string) => (headers: Headers): Maybe<Headers> =>
  Maybe.fromNullable(value)
    .map(v => ({
      ...headers,
      [key]: value
    }))
    .orElse(() => Maybe.of(headers));

const tokenHeader = (t: ?string) => (headers: Headers): Maybe<Headers> =>
  Maybe.fromNullable(t)
    .map(v => ({
      ...headers,
      'Authorization': `Bearer ${v}`
    }))
    .orElse(() => Maybe.of(headers));

const extraHeaders = (o: ?Object) => (headers: Headers): Maybe<Headers> =>
  Maybe.fromNullable(o)
    .map(v => ({
      ...headers,
      ...v
    }))
    .orElse(() => Maybe.of(headers));

const headers = ({
    id,
  version,
  token,
  extra
  }): Maybe<Headers> =>
  Maybe.of(HEADERS)
    .chain(simpleHeader(HEADER_ID, id))
    .chain(simpleHeader(HEADER_VERSION, version))
    .chain(tokenHeader(token))
    .chain(extraHeaders(extra));

export default (config: ?HeadersConfig): Headers =>
  Maybe.fromNullable(config)
    .chain(headers)
    .getOrElse(HEADERS);