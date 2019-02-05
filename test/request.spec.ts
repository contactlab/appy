import {constNull} from 'fp-ts/lib/function';

import {
  BadResponse,
  BadUrl,
  NetworkError,
  del,
  get,
  patch,
  post,
  put,
  request
} from '../src/request';
import './_helpers/mock-fetch';

beforeEach(() => {
  global.fetch.resetMocks();
});

test('request() should return a Right<Response> when everything is ok - with JSON', () => {
  global.fetch.mockResponseOnce(JSON.stringify({data: 'OK'}), {
    url: '/my/api',
    status: 200,
    statusText: 'Ok'
  });

  expect.assertions(2);

  return request('GET', '/my/api')
    .run()
    .then(r => {
      expect(r.isRight()).toBe(true);

      r.fold(constNull, response => {
        expect(response).toEqual({
          headers: {},
          status: 200,
          statusText: 'Ok',
          url: '/my/api',
          body: {data: 'OK'}
        });
      });
    });
});

test('request() should return a Right<Response> when everything is ok - with string', () => {
  global.fetch.mockResponseOnce('', {
    url: '/my/api',
    status: 200,
    statusText: 'Ok',
    headers: {'Custom-Header': 'Custom'}
  });

  expect.assertions(2);

  return request('GET', '/my/api')
    .run()
    .then(r => {
      expect(r.isRight()).toBe(true);

      r.fold(constNull, response => {
        expect(response).toEqual({
          // headers keys are lower-cased according to fetch specs
          // @see https://github.com/whatwg/fetch/issues/304
          headers: {'custom-header': 'Custom'},
          status: 200,
          statusText: 'Ok',
          url: '/my/api',
          body: ''
        });
      });
    });
});

test('request() should return a Left<NetworkError> when there is any network error', () => {
  global.fetch.mockRejectOnce(new TypeError('Connection error'));

  expect.assertions(4);

  return request('GET', '/my/api')
    .run()
    .then(r => {
      expect(r.isLeft()).toBe(true);

      r.fold(e => {
        expect(e.type).toBe('NetworkError');

        const netError = e as NetworkError;

        expect(netError.message).toBe('Connection error');
        expect(netError.uri).toBe('/my/api');
      }, constNull);
    });
});

test('request() should return a Left<BadUrl> when Response has status 404', () => {
  global.fetch.mockResponseOnce('', {
    url: '/my/api',
    status: 404,
    statusText: '404 - Not found'
  });

  expect.assertions(4);

  return request('GET', '/my/api')
    .run()
    .then(r => {
      expect(r.isLeft()).toBe(true);

      r.fold(e => {
        expect(e.type).toBe('BadUrl');

        const badUrl = e as BadUrl;

        expect(badUrl.url).toBe('/my/api');
        expect(badUrl.response).toEqual({
          headers: {},
          status: 404,
          statusText: '404 - Not found',
          url: '/my/api',
          body: ''
        });
      }, constNull);
    });
});

test('request() should return a Left<BadStatus> when Response is not ok and status is not 404', () => {
  global.fetch.mockResponseOnce(JSON.stringify({error: 'application error'}), {
    url: '/my/api',
    status: 500,
    statusText: '500 - Internal Server Error'
  });

  expect.assertions(3);

  return request('GET', '/my/api')
    .run()
    .then(r => {
      expect(r.isLeft()).toBe(true);

      r.fold(e => {
        expect(e.type).toBe('BadResponse');

        const badResp = e as BadResponse;

        expect(badResp.response).toEqual({
          headers: {},
          status: 500,
          statusText: '500 - Internal Server Error',
          url: '/my/api',
          body: {error: 'application error'}
        });
      }, constNull);
    });
});

test('get() should make a request with a `GET` method', () => {
  global.fetch.mockResponseOnce('', {url: '/my/api'});

  expect.assertions(1);

  return get('/my/api', {headers: {Authorization: 'Berear TOKEN'}})
    .run()
    .then(_ => {
      expect(global.fetch).toHaveBeenCalledWith('/my/api', {
        method: 'GET',
        headers: {Authorization: 'Berear TOKEN'}
      });
    });
});

test('post() should make a request with a `POST` method', () => {
  global.fetch.mockResponseOnce('', {url: '/my/api'});

  expect.assertions(1);

  return post('/my/api', {body: JSON.stringify({data: 123})})
    .run()
    .then(_ => {
      expect(global.fetch).toHaveBeenCalledWith('/my/api', {
        method: 'POST',
        body: JSON.stringify({data: 123})
      });
    });
});

test('put() should make a request with a `PUT` method', () => {
  global.fetch.mockResponseOnce('', {url: '/my/api'});

  expect.assertions(1);

  return put('/my/api', {body: JSON.stringify({data: 123})})
    .run()
    .then(_ => {
      expect(global.fetch).toHaveBeenCalledWith('/my/api', {
        method: 'PUT',
        body: JSON.stringify({data: 123})
      });
    });
});

test('patch() should make a request with a `PATCH` method', () => {
  global.fetch.mockResponseOnce('', {url: '/my/api'});

  expect.assertions(1);

  return patch('/my/api', {body: JSON.stringify({data: 123})})
    .run()
    .then(_ => {
      expect(global.fetch).toHaveBeenCalledWith('/my/api', {
        method: 'PATCH',
        body: JSON.stringify({data: 123})
      });
    });
});

test('del() should make a request with a `DELETE` method', () => {
  global.fetch.mockResponseOnce('', {url: '/my/api'});

  expect.assertions(1);

  return del('/my/api', {mode: 'cors'})
    .run()
    .then(_ => {
      expect(global.fetch).toHaveBeenCalledWith('/my/api', {
        method: 'DELETE',
        mode: 'cors'
      });
    });
});
