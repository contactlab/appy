// --- Mocks
import './_helpers/mock-fetch';
// ---

import {del, get, patch, post, put, request} from '../request';
import {result} from './_helpers/result';

beforeEach(() => {
  global.fetch.resetMocks();
});

test('request() should return a Right<Response> when everything is ok - with JSON', () => {
  global.fetch.mockResponseOnce(JSON.stringify({data: 'OK'}), {
    url: '/my/api',
    status: 200,
    statusText: 'Ok'
  });

  return expect(result(request('GET', '/my/api'))).resolves.toEqual({
    headers: {},
    status: 200,
    statusText: 'Ok',
    url: '/my/api',
    body: {data: 'OK'}
  });
});

test('request() should return a Right<Response> when everything is ok - with string', () => {
  global.fetch.mockResponseOnce('', {
    url: '/my/api',
    status: 200,
    statusText: 'Ok',
    headers: {'Custom-Header': 'Custom'}
  });

  return expect(result(request('GET', '/my/api'))).resolves.toEqual({
    // headers keys are lower-cased according to fetch specs
    // @see https://github.com/whatwg/fetch/issues/304
    headers: {'custom-header': 'Custom'},
    status: 200,
    statusText: 'Ok',
    url: '/my/api',
    body: ''
  });
});

test('request() should return a Left<NetworkError> when there is any network error', () => {
  global.fetch.mockRejectOnce(new TypeError('Connection error'));

  return expect(result(request('GET', '/my/api'))).rejects.toEqual({
    type: 'NetworkError',
    message: 'Connection error',
    uri: '/my/api'
  });
});

test('request() should return a Left<BadUrl> when Response has status 404', () => {
  global.fetch.mockResponseOnce('', {
    url: '/my/api',
    status: 404,
    statusText: '404 - Not found'
  });

  return expect(result(request('GET', '/my/api'))).rejects.toEqual({
    type: 'BadUrl',
    url: '/my/api',
    response: {
      headers: {},
      status: 404,
      statusText: '404 - Not found',
      url: '/my/api',
      body: ''
    }
  });
});

test('request() should return a Left<BadStatus> when Response is not ok and status is not 404', () => {
  global.fetch.mockResponseOnce(JSON.stringify({error: 'application error'}), {
    url: '/my/api',
    status: 500,
    statusText: '500 - Internal Server Error'
  });

  return expect(result(request('GET', '/my/api'))).rejects.toEqual({
    type: 'BadResponse',
    response: {
      headers: {},
      status: 500,
      statusText: '500 - Internal Server Error',
      url: '/my/api',
      body: {error: 'application error'}
    }
  });
});

test('get() should make a request with a `GET` method', () => {
  global.fetch.mockResponseOnce('', {url: '/my/api'});

  const req = get('/my/api', {headers: {Authorization: 'Berear TOKEN'}});

  return req().then(() => {
    expect(global.fetch).toHaveBeenCalledWith('/my/api', {
      method: 'GET',
      headers: {Authorization: 'Berear TOKEN'}
    });
  });
});

test('post() should make a request with a `POST` method', () => {
  global.fetch.mockResponseOnce('', {url: '/my/api'});

  const req = post('/my/api', {body: JSON.stringify({data: 123})});

  return req().then(() => {
    expect(global.fetch).toHaveBeenCalledWith('/my/api', {
      method: 'POST',
      body: JSON.stringify({data: 123})
    });
  });
});

test('put() should make a request with a `PUT` method', () => {
  global.fetch.mockResponseOnce('', {url: '/my/api'});

  const req = put('/my/api', {body: JSON.stringify({data: 123})});

  return req().then(() => {
    expect(global.fetch).toHaveBeenCalledWith('/my/api', {
      method: 'PUT',
      body: JSON.stringify({data: 123})
    });
  });
});

test('patch() should make a request with a `PATCH` method', () => {
  global.fetch.mockResponseOnce('', {url: '/my/api'});

  const req = patch('/my/api', {body: JSON.stringify({data: 123})});

  return req().then(() => {
    expect(global.fetch).toHaveBeenCalledWith('/my/api', {
      method: 'PATCH',
      body: JSON.stringify({data: 123})
    });
  });
});

test('del() should make a request with a `DELETE` method', () => {
  global.fetch.mockResponseOnce('', {url: '/my/api'});

  const req = del('/my/api', {mode: 'cors'});

  return req().then(() => {
    expect(global.fetch).toHaveBeenCalledWith('/my/api', {
      method: 'DELETE',
      mode: 'cors'
    });
  });
});
