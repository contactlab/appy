// @flow

declare type DefaultHeaders = {
  'Accept': string,
  'Content-type': string
}

declare type CustomHeaders = {
  'Contactlab-ClientId' ? : string,
  'Contactlab-ClientVersion' ? : string,
  'Authorization' ? : string
};

type Headers = DefaultHeaders & CustomHeaders;

declare type HeadersConfig = {
  id ? : string,
  version ? : string,
  token ? : string,
  custom ? : Object
}