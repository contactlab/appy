// flow

declare type RequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  headers: StaticHeaders & ConfigHeaders,
  mode: string,
  body?: string | Object | any[]
}