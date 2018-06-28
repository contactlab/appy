import {constNull} from 'fp-ts/lib/function';
import * as t from 'io-ts';
import {failure} from 'io-ts/lib/PathReporter';

import {DecoderError, api} from '../src/api';
import './_helpers/mock-fetch';

beforeEach(() => {
  global.fetch.resetMocks();
});

test('api().request() should call full url, decode response and return Right<AppyResponse<A>>', () => {
  global.fetch.mockResponseOnce(JSON.stringify({data: 'OK'}), {
    url: 'http://localhost/api/v1/my/api',
    status: 200,
    statusText: 'OK'
  });

  const myApi = api({baseUri: 'http://localhost/api/v1'});
  const decoder = t.type({data: t.string});

  expect.assertions(3);

  return myApi
    .request('GET', '/my/api', {token: 'secret', decoder})
    .run()
    .then(r => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost/api/v1/my/api',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer secret',
            Accept: 'application/json',
            'Content-type': 'application/json'
          },
          mode: 'cors'
        }
      );

      expect(r.isRight()).toBe(true);

      r.fold(constNull, result => {
        expect(result).toEqual({
          headers: {},
          status: 200,
          statusText: 'OK',
          url: 'http://localhost/api/v1/my/api',
          body: {data: 'OK'}
        });
      });
    });
});

test('api().request() should call full url, decode response and return Left<DecoderError>', () => {
  global.fetch.mockResponseOnce(JSON.stringify({data: true}), {
    url: 'http://localhost/api/v1/my/api',
    status: 200,
    statusText: 'OK'
  });

  const myApi = api({baseUri: 'http://localhost/api/v1'});
  const decoder = t.type({data: t.string});

  expect.assertions(3);

  return myApi
    .request('GET', '/my/api', {token: 'secret', decoder})
    .run()
    .then(r => {
      expect(r.isLeft()).toBe(true);

      r.fold(err => {
        expect(err.type).toBe('DecoderError');

        expect(failure((err as DecoderError).errors)).toEqual([
          'Invalid value true supplied to : { data: string }/data: string'
        ]);
      }, constNull);
    });
});

test('api().request() should call full url, with id and version headers and custom options', () => {
  global.fetch.mockResponseOnce('', {
    url: 'http://localhost/api/v1/my/api',
    status: 200,
    statusText: 'OK'
  });

  const myApi = api({
    baseUri: 'http://localhost/api/v1',
    id: 'TestApp',
    version: '1.2.3'
  });

  expect.assertions(1);

  return myApi
    .request('GET', '/my/api', {
      token: 'secret',
      decoder: t.string,
      headers: {'Custom-Header': 'custom'},
      mode: 'same-origin',
      cache: 'no-cache'
    })
    .run()
    .then(_ => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost/api/v1/my/api',
        {
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
        }
      );
    });
});

test('api().get() should make a GET request', () => {
  global.fetch.mockResponseOnce('', {url: '/my/api'});

  const myApi = api({baseUri: 'http://localhost/api/v1'});

  expect.assertions(1);

  return myApi
    .get('/my/api', {token: 'secret', decoder: t.string})
    .run()
    .then(_ => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost/api/v1/my/api',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer secret',
            Accept: 'application/json',
            'Content-type': 'application/json'
          },
          mode: 'cors'
        }
      );
    });
});

test('api().post() should make a POST request', () => {
  global.fetch.mockResponseOnce('', {url: '/my/api'});

  const myApi = api({baseUri: 'http://localhost/api/v1'});

  expect.assertions(1);

  return myApi
    .post('/my/api', {
      token: 'secret',
      decoder: t.string,
      body: JSON.stringify({data: 123})
    })
    .run()
    .then(_ => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost/api/v1/my/api',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer secret',
            Accept: 'application/json',
            'Content-type': 'application/json'
          },
          mode: 'cors',
          body: JSON.stringify({data: 123})
        }
      );
    });
});

test('api().put() should make a PUT request', () => {
  global.fetch.mockResponseOnce('', {url: '/my/api'});

  const myApi = api({baseUri: 'http://localhost/api/v1'});

  expect.assertions(1);

  return myApi
    .put('/my/api', {
      token: 'secret',
      decoder: t.string,
      body: JSON.stringify({data: 123})
    })
    .run()
    .then(_ => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost/api/v1/my/api',
        {
          method: 'PUT',
          headers: {
            Authorization: 'Bearer secret',
            Accept: 'application/json',
            'Content-type': 'application/json'
          },
          mode: 'cors',
          body: JSON.stringify({data: 123})
        }
      );
    });
});

test('api().patch() should make a PATCH request', () => {
  global.fetch.mockResponseOnce('', {url: '/my/api'});

  const myApi = api({baseUri: 'http://localhost/api/v1'});

  expect.assertions(1);

  return myApi
    .patch('/my/api', {
      token: 'secret',
      decoder: t.string,
      body: JSON.stringify({data: 123})
    })
    .run()
    .then(_ => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost/api/v1/my/api',
        {
          method: 'PATCH',
          headers: {
            Authorization: 'Bearer secret',
            Accept: 'application/json',
            'Content-type': 'application/json'
          },
          mode: 'cors',
          body: JSON.stringify({data: 123})
        }
      );
    });
});

test('api().del() should make a DELETE request', () => {
  global.fetch.mockResponseOnce('', {url: '/my/api'});

  const myApi = api({baseUri: 'http://localhost/api/v1'});

  expect.assertions(1);

  return myApi
    .del('/my/api', {
      token: 'secret',
      decoder: t.string,
      mode: 'same-origin',
      headers: {'Content-type': 'text/html'}
    })
    .run()
    .then(_ => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost/api/v1/my/api',
        {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer secret',
            Accept: 'application/json',
            'Content-type': 'text/html'
          },
          mode: 'same-origin'
        }
      );
    });
});
