import {left, right} from 'fp-ts/lib/Either';
import {del, get, patch, post, put, request} from '../src/request';

const fetch = global.fetch;

beforeEach(() => {
  fetch.resetMocks();
});

test('request() should return a Right<Response> when everything is ok - with JSON', async () => {
  fetch.mockResponseOnce(JSON.stringify({data: 'OK'}), {
    headers: {'Content-type': 'application/json'},
    url: '/my/api',
    status: 200,
    statusText: 'Ok'
  });

  const result = await request('GET', '/my/api')();

  expect(result).toEqual(
    right({
      headers: {'content-type': 'application/json'},
      status: 200,
      statusText: 'Ok',
      url: '/my/api',
      body: {data: 'OK'}
    })
  );
});

test('request() should return a Right<Response> when everything is ok - with string', async () => {
  fetch.mockResponseOnce('', {
    url: '/my/api',
    status: 200,
    statusText: 'Ok',
    headers: {'Content-type': 'application/json', 'Custom-Header': 'Custom'}
  });

  const result = await request('GET', '/my/api')();

  expect(result).toEqual(
    right({
      // headers keys are lower-cased according to fetch specs
      // @see https://github.com/whatwg/fetch/issues/304
      headers: {
        'content-type': 'application/json',
        'custom-header': 'Custom'
      },
      status: 200,
      statusText: 'Ok',
      url: '/my/api',
      body: ''
    })
  );
});

test('request() should return a Left<NetworkError> when there is any network error', async () => {
  fetch.mockRejectOnce(new TypeError('Connection error'));

  const result = await request('GET', '/my/api')();

  expect(result).toEqual(
    left({
      type: 'NetworkError',
      message: 'Connection error',
      uri: '/my/api'
    })
  );
});

test('request() should return a Left<BadUrl> when Response has status 404', async () => {
  fetch.mockResponseOnce('', {
    headers: {'Content-type': 'application/json'},
    url: '/my/api',
    status: 404,
    statusText: '404 - Not found'
  });

  const result = await request('GET', '/my/api')();

  expect(result).toEqual(
    left({
      type: 'BadUrl',
      url: '/my/api',
      response: {
        headers: {'content-type': 'application/json'},
        status: 404,
        statusText: '404 - Not found',
        url: '/my/api',
        body: ''
      }
    })
  );
});

test('request() should return a Left<BadStatus> when Response is not ok and status is not 404', async () => {
  fetch.mockResponseOnce(JSON.stringify({error: 'application error'}), {
    headers: {'Content-type': 'application/json'},
    url: '/my/api',
    status: 500,
    statusText: '500 - Internal Server Error'
  });

  const result = await request('GET', '/my/api')();

  expect(result).toEqual(
    left({
      type: 'BadResponse',
      response: {
        headers: {'content-type': 'application/json'},
        status: 500,
        statusText: '500 - Internal Server Error',
        url: '/my/api',
        body: {error: 'application error'}
      }
    })
  );
});

test('get() should make a request with a `GET` method', async () => {
  fetch.mockResponseOnce('', {url: '/my/api'});

  const req = get('/my/api', {headers: {Authorization: 'Berear TOKEN'}});

  await req();

  expect(fetch).toHaveBeenCalledWith('/my/api', {
    method: 'GET',
    headers: {Authorization: 'Berear TOKEN'}
  });
});

test('post() should make a request with a `POST` method', async () => {
  fetch.mockResponseOnce('', {url: '/my/api'});

  const req = post('/my/api', {body: JSON.stringify({data: 123})});

  await req();

  expect(fetch).toHaveBeenCalledWith('/my/api', {
    method: 'POST',
    body: JSON.stringify({data: 123})
  });
});

test('put() should make a request with a `PUT` method', async () => {
  fetch.mockResponseOnce('', {url: '/my/api'});

  const req = put('/my/api', {body: JSON.stringify({data: 123})});

  await req();

  expect(fetch).toHaveBeenCalledWith('/my/api', {
    method: 'PUT',
    body: JSON.stringify({data: 123})
  });
});

test('patch() should make a request with a `PATCH` method', async () => {
  fetch.mockResponseOnce('', {url: '/my/api'});

  const req = patch('/my/api', {body: JSON.stringify({data: 123})});

  await req();

  expect(fetch).toHaveBeenCalledWith('/my/api', {
    method: 'PATCH',
    body: JSON.stringify({data: 123})
  });
});

test('del() should make a request with a `DELETE` method', async () => {
  fetch.mockResponseOnce('', {url: '/my/api'});

  const req = del('/my/api', {mode: 'cors'});

  await req();

  expect(fetch).toHaveBeenCalledWith('/my/api', {
    method: 'DELETE',
    mode: 'cors'
  });
});
