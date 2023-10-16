import fetchMock from 'fetch-mock';
import {right, left, isLeft} from 'fp-ts/Either';
import {
  type Err,
  type RequestInfoInit,
  type Resp,
  request,
  requestAs,
  toRequestError,
  toResponseError
} from '../src/request';

afterEach(() => {
  fetchMock.reset();
});

const requestAsBlob = requestAs('blob');

test('requestAs() should return a right `Resp` of provided type', async () => {
  const response = new Response('a list of resources', {
    status: 200,
    headers: {}
  });

  fetchMock.mock('http://localhost/api/resources', response);

  const r = await requestAsBlob('http://localhost/api/resources')();

  if (isLeft(r)) {
    throw new Error();
  }

  expect(r.right.response).toEqual(response);

  const data = await r.right.data.text();

  expect(data).toBe('a list of resources');
});

test('requestAs() should return a left `RequestError` when request fails', async () => {
  const error = new TypeError('Network error');

  fetchMock.mock('http://localhost/api/resources', {throws: error});

  const r1 = await requestAsBlob('http://localhost/api/resources')();

  const err1: Err = {
    type: 'RequestError',
    error,
    input: ['http://localhost/api/resources', {}]
  };

  expect(r1).toEqual(left(err1));

  const r2 = await requestAsBlob([
    'http://localhost/api/resources',
    {method: 'GET', headers: {'X-Some-Header': 'some value'}}
  ])();

  const err2: Err = {
    type: 'RequestError',
    error,
    input: [
      'http://localhost/api/resources',
      {method: 'GET', headers: {'X-Some-Header': 'some value'}}
    ]
  };

  expect(r2).toEqual(left(err2));
});

test('requestAs() should return a left `ResponseError` when response status is not ok', async () => {
  const response = new Response('a list of resources', {
    status: 503
  });

  fetchMock.mock('http://localhost/api/resources', response);

  const r = await requestAsBlob('http://localhost/api/resources')();

  const err: Err = {
    type: 'ResponseError',
    response,
    error: new Error(`Request responded with status code 503`),
    input: ['http://localhost/api/resources', {}]
  };

  expect(r).toEqual(left(err));
});

test('request() should return a right `Resp<string>` - default GET', async () => {
  const response = new Response('a list of resources', {
    status: 200,
    headers: {}
  });

  fetchMock.mock('http://localhost/api/resources', response);

  const r = await request('http://localhost/api/resources')();

  const resp: Resp<string> = {
    response,
    data: 'a list of resources',
    input: ['http://localhost/api/resources', {}]
  };

  expect(r).toEqual(right(resp));
});

test('request() should return a right `Resp<string>` - with POST', async () => {
  const response = new Response('POST - a list of resources', {status: 200});

  fetchMock.post('http://localhost/api/post-resources', response);

  const r = await request([
    'http://localhost/api/post-resources',
    {method: 'POST', body: ''}
  ])();

  const resp: Resp<string> = {
    response,
    data: 'POST - a list of resources',
    input: ['http://localhost/api/post-resources', {method: 'POST', body: ''}]
  };

  expect(r).toEqual(right(resp));
});

test('request() should return a left `RequestError` when request fails', async () => {
  const error = new TypeError('Network error');

  fetchMock.mock('http://localhost/api/resources', {throws: error});

  const r1 = await request('http://localhost/api/resources')();

  const err1: Err = {
    type: 'RequestError',
    error,
    input: ['http://localhost/api/resources', {}]
  };

  expect(r1).toEqual(left(err1));

  const r2 = await request([
    'http://localhost/api/resources',
    {method: 'GET', headers: {'X-Some-Header': 'some value'}}
  ])();

  const err2: Err = {
    type: 'RequestError',
    error,
    input: [
      'http://localhost/api/resources',
      {method: 'GET', headers: {'X-Some-Header': 'some value'}}
    ]
  };

  expect(r2).toEqual(left(err2));
});

test('request() should return a left `ResponseError` when response status is not ok', async () => {
  const response = new Response('a list of resources', {
    status: 503
  });

  fetchMock.mock('http://localhost/api/resources', response);

  const r = await request('http://localhost/api/resources')();

  const err: Err = {
    type: 'ResponseError',
    response,
    error: new Error(`Request responded with status code 503`),
    input: ['http://localhost/api/resources', {}]
  };

  expect(r).toEqual(left(err));
});

test('toRequestError() should return a RequestError', () => {
  const error = new TypeError('something bad happened');
  const input: RequestInfoInit = ['http://localhost/my/api', {method: 'GET'}];

  const err: Err = {
    type: 'RequestError',
    error,
    input
  };

  expect(toRequestError(error, input)).toEqual(err);
});

test('toResponseError() should return a ResponseError', () => {
  const response = new Response('bad', {status: 500});
  const badStatus = new Error('Request responded with status 500');
  const input: RequestInfoInit = ['http://localhost/my/api', {method: 'GET'}];

  const err1: Err = {
    type: 'ResponseError',
    error: badStatus,
    response
  };

  expect(toResponseError(badStatus, response)).toEqual(err1);

  const err2 = {
    type: 'ResponseError',
    error: badStatus,
    response,
    input
  };

  expect(toResponseError(badStatus, response, input)).toEqual(err2);
});
