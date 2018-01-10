// flow

declare type RequestOptions = {
  method: string,
  mode: string,
  headers: Headers,
  body?: string | Object | any[]
}

declare type OptionsConfig = {
  method: string,
  mode: string,
  headers: HeadersConfig,
  body?: string | Object | any[]
}

declare type InitOptionsConfig = {
  mode: string,
  headers: HeadersConfig,
  body?: string | Object | any[]
}