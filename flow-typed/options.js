// flow

declare type RequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  mode: string,
  headers: Headers,
  body ? : string | Object | any[]
}

declare type OptionsConfig = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  mode: string,
  headers: HeadersConfig,
  body ? : string | Object | any[]
}