import fetchMock from 'fetch-mock';
import {right, left} from 'fp-ts/Either';
import * as AR from '../src/request';

afterEach(() => {
  fetchMock.reset();
});

test('request() should return a right `Resp<string>` - default GET', async () => {
  const response = new Response('a list of resources', {
    status: 200,
    headers: {}
  });

  fetchMock.mock('http://localhost/api/resources', response);

  const r = await AR.request('http://localhost/api/resources')();

  expect(r).toEqual(right({response, data: 'a list of resources'}));
});

test('request() should return a right `Resp<string>` - with POST', async () => {
  const response = new Response('POST - a list of resources', {status: 200});

  fetchMock.post('http://localhost/api/post-resources', response);

  const r = await AR.request([
    'http://localhost/api/post-resources',
    {method: 'POST', body: ''}
  ])();

  expect(r).toEqual(right({response, data: 'POST - a list of resources'}));
});

test('request() should return a left `RequestError` when request fails', async () => {
  const error = new TypeError('Network error');

  fetchMock.mock('http://localhost/api/resources', {throws: error});

  const r1 = await AR.request('http://localhost/api/resources')();

  expect(r1).toEqual(
    left({
      type: 'RequestError',
      error,
      input: ['http://localhost/api/resources', {}]
    })
  );

  const r2 = await AR.request([
    'http://localhost/api/resources',
    {method: 'GET', headers: {'X-Some-Header': 'some value'}}
  ])();

  expect(r2).toEqual(
    left({
      type: 'RequestError',
      error,
      input: [
        'http://localhost/api/resources',
        {method: 'GET', headers: {'X-Some-Header': 'some value'}}
      ]
    })
  );
});

test('request() should return a left `ResponseError` when response status is not ok', async () => {
  const response = new Response('a list of resources', {
    status: 503
  });

  fetchMock.mock('http://localhost/api/resources', response);

  const r = await AR.request('http://localhost/api/resources')();

  expect(r).toEqual(
    left({
      type: 'ResponseError',
      response,
      error: new Error(`Request responded with status code 503`)
    })
  );
});

test('toRequestError() should return a RequestError', () => {
  const error = new TypeError('something bad happened');
  const input: AR.RequestInfoInit = [
    'http://localhost/my/api',
    {method: 'GET'}
  ];

  expect(AR.toRequestError(error, input)).toEqual({
    type: 'RequestError',
    error,
    input
  });
});

test('toResponseError() should return a ResponseError', () => {
  const response = new Response('bad', {status: 500});
  const badStatus = new Error('Request responded with status 500');

  expect(AR.toResponseError(badStatus, response)).toEqual({
    type: 'ResponseError',
    error: badStatus,
    response
  });
});
