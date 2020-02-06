import {either, left, right} from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import {failure} from 'io-ts/lib/PathReporter';
import {api} from '../src/api';

const fetch = global.fetch;

beforeEach(() => {
  fetch.resetMocks();
});

test('api().request() should call full url, decode response and return Right<Response<A>>', async () => {
  fetch.mockResponseOnce(JSON.stringify({data: 'OK'}), {
    headers: {'Content-type': 'application/json'},
    url: 'http://localhost/api/v1/my/api',
    status: 200,
    statusText: 'OK'
  });

  const myApi = api({baseUri: 'http://localhost/api/v1'});
  const decoder = t.type({data: t.string});
  const request = myApi.request('GET', '/my/api', {token: 'secret', decoder});

  const result = await request();

  expect(result).toEqual(
    right({
      headers: {'content-type': 'application/json'},
      status: 200,
      statusText: 'OK',
      url: 'http://localhost/api/v1/my/api',
      body: {data: 'OK'}
    })
  );

  expect(fetch).toHaveBeenCalledWith('http://localhost/api/v1/my/api', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer secret',
      Accept: 'application/json',
      'Content-type': 'application/json'
    },
    mode: 'cors'
  });
});

test('api().request() should call full url, decode response and return Left<DecoderError>', async () => {
  fetch.mockResponseOnce(JSON.stringify({data: true}), {
    url: 'http://localhost/api/v1/my/api',
    status: 200,
    statusText: 'OK'
  });

  const myApi = api({baseUri: 'http://localhost/api/v1'});
  const decoder = t.type({data: t.string});
  const request = myApi.request('GET', '/my/api', {token: 'secret', decoder});

  const result = await request();

  expect(
    either.mapLeft(result, e => ({...e, errors: failure((e as any).errors)}))
  ).toEqual(
    left({
      type: 'DecoderError',
      errors: ['Invalid value true supplied to : { data: string }/data: string']
    })
  );
});

test('api().request() should call full url, with id and version headers and custom options', async () => {
  fetch.mockResponseOnce('', {
    url: 'http://localhost/api/v1/my/api',
    status: 200,
    statusText: 'OK'
  });

  const myApi = api({
    baseUri: 'http://localhost/api/v1',
    id: 'TestApp',
    version: '1.2.3'
  });
  const request = myApi.request('GET', '/my/api', {
    token: 'secret',
    decoder: t.string,
    headers: {'Custom-Header': 'custom'},
    mode: 'same-origin',
    cache: 'no-cache'
  });

  await request();

  expect(fetch).toHaveBeenCalledWith('http://localhost/api/v1/my/api', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer secret',
      Accept: 'application/json',
      'Contactlab-ClientId': 'TestApp',
      'Contactlab-ClientVersion': '1.2.3',
      'Content-type': 'application/json',
      'Custom-Header': 'custom'
    },
    mode: 'same-origin',
    cache: 'no-cache'
  });
});

test('api().get() should make a GET request', async () => {
  fetch.mockResponseOnce('', {url: '/my/api'});

  const myApi = api({baseUri: 'http://localhost/api/v1'});
  const request = myApi.get('/my/api', {token: 'secret', decoder: t.string});

  await request();

  expect(fetch).toHaveBeenCalledWith('http://localhost/api/v1/my/api', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer secret',
      Accept: 'application/json',
      'Content-type': 'application/json'
    },
    mode: 'cors'
  });
});

test('api().post() should make a POST request', async () => {
  fetch.mockResponseOnce('', {url: '/my/api'});

  const myApi = api({baseUri: 'http://localhost/api/v1'});
  const request = myApi.post('/my/api', {
    token: 'secret',
    decoder: t.string,
    body: JSON.stringify({data: 123})
  });

  await request();

  expect(fetch).toHaveBeenCalledWith('http://localhost/api/v1/my/api', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer secret',
      Accept: 'application/json',
      'Content-type': 'application/json'
    },
    mode: 'cors',
    body: JSON.stringify({data: 123})
  });
});

test('api().put() should make a PUT request', async () => {
  fetch.mockResponseOnce('', {url: '/my/api'});

  const myApi = api({baseUri: 'http://localhost/api/v1'});
  const request = myApi.put('/my/api', {
    token: 'secret',
    decoder: t.string,
    body: JSON.stringify({data: 123})
  });

  await request();

  expect(fetch).toHaveBeenCalledWith('http://localhost/api/v1/my/api', {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer secret',
      Accept: 'application/json',
      'Content-type': 'application/json'
    },
    mode: 'cors',
    body: JSON.stringify({data: 123})
  });
});

test('api().patch() should make a PATCH request', async () => {
  fetch.mockResponseOnce('', {url: '/my/api'});

  const myApi = api({baseUri: 'http://localhost/api/v1'});
  const request = myApi.patch('/my/api', {
    token: 'secret',
    decoder: t.string,
    body: JSON.stringify({data: 123})
  });

  await request();

  expect(fetch).toHaveBeenCalledWith('http://localhost/api/v1/my/api', {
    method: 'PATCH',
    headers: {
      Authorization: 'Bearer secret',
      Accept: 'application/json',
      'Content-type': 'application/json'
    },
    mode: 'cors',
    body: JSON.stringify({data: 123})
  });
});

test('api().del() should make a DELETE request', async () => {
  fetch.mockResponseOnce('', {url: '/my/api'});

  const myApi = api({baseUri: 'http://localhost/api/v1'});
  const request = myApi.del('/my/api', {
    token: 'secret',
    decoder: t.string,
    mode: 'same-origin',
    headers: {'Content-type': 'text/html'}
  });

  await request();

  expect(fetch).toHaveBeenCalledWith('http://localhost/api/v1/my/api', {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer secret',
      Accept: 'application/json',
      'Content-type': 'text/html'
    },
    mode: 'same-origin'
  });
});
