// @flow

declare type Response = {
  headers: Object,
  ok: boolean,
  redirected: boolean,
  status: number,
  statusText: string,
  type: string,
  url: string,
  useFinalURL: boolean,
  json: Promise<Object>,
  text: Promise<string>,
}

declare type Payload = {
  message?: string
}

declare type NomarlizedResponse = {
  status: number,
  payload: Payload
}