import fetchMock from 'fetch-mock';
import {left, right} from 'fp-ts/Either';
import {pipe} from 'fp-ts/function';
import {withCancel, withTimeout} from '../src/combinators/abort';
import * as appy from '../src/index';

type Resp = appy.Resp<string>;

afterEach(() => {
  fetchMock.reset();
});

test('withCancel() should set signal on `Req` and make request abortable', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const controller = new AbortController();

  const request = withCancel(controller)(appy.request);

  controller.abort();

  const result = await request('http://localhost/api/resources')();

  const err: appy.Err = {
    type: 'RequestError',
    error: new AbortError(),
    input: ['http://localhost/api/resources', {signal: controller.signal}]
  };

  expect(result).toEqual(left(err));
});

test('withCancel() should set signal on `Req` and make request abortable - multiple calls', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const controller1 = new AbortController();
  const controller2 = new AbortController();

  const request = pipe(
    appy.request,
    withCancel(controller1),
    withCancel(controller2)
  );

  controller2.abort();

  const result = await request('http://localhost/api/resources')();

  const err: appy.Err = {
    type: 'RequestError',
    error: new AbortError(),
    input: ['http://localhost/api/resources', {signal: controller2.signal}]
  };

  expect(result).toEqual(left(err));
});

test('withCancel() should merge provided signal with `Req` one - but `Req` wins', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const controller1 = new AbortController();
  const controller2 = new AbortController();

  const request = withCancel(controller1)(appy.request);

  controller2.abort();

  const result = await request([
    'http://localhost/api/resources',
    {signal: controller2.signal}
  ])();

  const err: appy.Err = {
    type: 'RequestError',
    error: new AbortError(),
    input: ['http://localhost/api/resources', {signal: controller2.signal}]
  };

  expect(result).toEqual(left(err));
});

test('withTimeout() should succeed if we get a response within provided milliseconds', async () => {
  const response = new Response('a list of resources', {
    status: 200,
    headers: {}
  });

  fetchMock.mock('http://localhost/api/resources', response, {delay: 500});

  const request = withTimeout(1000)(appy.request);

  const result = await request('http://localhost/api/resources')();

  const resp: Resp = {
    response,
    data: 'a list of resources',
    input: [
      'http://localhost/api/resources',
      {signal: new AbortController().signal}
    ]
  };

  expect(result).toEqual(right(resp));
});

test('withTimeout() should succeed if we get a response within provided milliseconds - multiple calls', async () => {
  const response = new Response('a list of resources', {
    status: 200,
    headers: {}
  });

  fetchMock.mock('http://localhost/api/resources', response, {delay: 500});

  const request = pipe(appy.request, withTimeout(250), withTimeout(1000));

  const result = await request('http://localhost/api/resources')();

  const resp: Resp = {
    response,
    data: 'a list of resources',
    input: [
      'http://localhost/api/resources',
      {signal: new AbortController().signal}
    ]
  };

  expect(result).toEqual(right(resp));
});

test('withTimeout() should fail if we do not get a response within provided milliseconds', async () => {
  fetchMock.mock('http://localhost/api/resources', 200, {delay: 1000});

  const request = withTimeout(500)(appy.request);

  const result = await request('http://localhost/api/resources')();

  const err: appy.Err = {
    type: 'RequestError',
    error: new AbortError(),
    input: [
      'http://localhost/api/resources',
      {signal: new AbortController().signal}
    ]
  };

  expect(result).toEqual(left(err));
});

test('withTimeout() should fail if we do not get a response within provided milliseconds - multiple calls', async () => {
  fetchMock.mock('http://localhost/api/resources', 200, {delay: 1000});

  const request = pipe(appy.request, withTimeout(1500), withTimeout(500));

  const result = await request('http://localhost/api/resources')();

  const err: appy.Err = {
    type: 'RequestError',
    error: new AbortError(),
    input: [
      'http://localhost/api/resources',
      {signal: new AbortController().signal}
    ]
  };

  expect(result).toEqual(left(err));
});

// --- Helpers
class AbortError extends Error {
  constructor(message: string = 'The operation was aborted.') {
    super(message);

    this.name = 'AbortError';
    this.message = message;
  }
}
