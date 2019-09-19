// --- Mocks
import './_helpers/mock-fetch';
// ---

import * as t from 'io-ts';
import {failure} from 'io-ts/lib/PathReporter';
import {api} from '../api';
import {result} from './_helpers/result';

beforeEach(() => {
  global.fetch.resetMocks();
});

test('api().request() should call full url, decode response and return Right<Response<A>>', () => {
  global.fetch.mockResponseOnce(JSON.stringify({data: 'OK'}), {
    url: 'http://localhost/api/v1/my/api',
    status: 200,
    statusText: 'OK'
  });

  const myApi = api({baseUri: 'http://localhost/api/v1'});
  const decoder = t.type({data: t.string});
  const req = myApi.request('GET', '/my/api', {token: 'secret', decoder});

  return expect(result(req))
    .resolves.toEqual({
      headers: {},
      status: 200,
      statusText: 'OK',
      url: 'http://localhost/api/v1/my/api',
      body: {data: 'OK'}
    })
    .then(() => {
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

test('api().request() should call full url, decode response and return Left<DecoderError>', () => {
  global.fetch.mockResponseOnce(JSON.stringify({data: true}), {
    url: 'http://localhost/api/v1/my/api',
    status: 200,
    statusText: 'OK'
  });

  const myApi = api({baseUri: 'http://localhost/api/v1'});
  const decoder = t.type({data: t.string});
  const request = myApi.request('GET', '/my/api', {token: 'secret', decoder});

  return result(request).catch(err => {
    expect(err.type).toBe('DecoderError');
    expect(failure((err as any).errors)).toEqual([
      'Invalid value true supplied to : { data: string }/data: string'
    ]);
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
  const request = myApi.request('GET', '/my/api', {
    token: 'secret',
    decoder: t.string,
    headers: {'Custom-Header': 'custom'},
    mode: 'same-origin',
    cache: 'no-cache'
  });

  return result(request).then(() => {
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
  const request = myApi.get('/my/api', {token: 'secret', decoder: t.string});

  return result(request).then(() => {
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
  const request = myApi.post('/my/api', {
    token: 'secret',
    decoder: t.string,
    body: JSON.stringify({data: 123})
  });

  return result(request).then(() => {
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
  const request = myApi.put('/my/api', {
    token: 'secret',
    decoder: t.string,
    body: JSON.stringify({data: 123})
  });

  return result(request).then(() => {
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
  const request = myApi.patch('/my/api', {
    token: 'secret',
    decoder: t.string,
    body: JSON.stringify({data: 123})
  });

  return result(request).then(() => {
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
  const request = myApi.del('/my/api', {
    token: 'secret',
    decoder: t.string,
    mode: 'same-origin',
    headers: {'Content-type': 'text/html'}
  });

  return result(request).then(() => {
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
