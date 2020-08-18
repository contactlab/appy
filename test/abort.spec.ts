import fetchMock from 'fetch-mock';
import {left, right} from 'fp-ts/lib/Either';
import {withCancel, withTimeout} from '../src/combinators/abort';
import * as appy from '../src/index';

afterEach(() => {
  fetchMock.reset();
});

test('withCancel() should set signal on `Req` and make request abortable', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const controller = new AbortController();

  const request = withCancel(controller)(appy.request);

  controller.abort();

  const result = await request('http://localhost/api/resources')();

  expect(result).toEqual(
    left({
      type: 'RequestError',
      error: new AbortError(),
      input: ['http://localhost/api/resources', {signal: controller.signal}]
    })
  );
});

test('withTimeout() should succeed if we get a response within provided milliseconds', async () => {
  const response = new Response('a list of resources', {
    status: 200,
    headers: {}
  });

  fetchMock.mock('http://localhost/api/resources', response, {delay: 500});

  const request = withTimeout(1000)(appy.request);

  const result = await request('http://localhost/api/resources')();

  expect(result).toEqual(right({response, data: 'a list of resources'}));
});

test('withTimeout() should fail if we do not get a response within provided milliseconds', async () => {
  fetchMock.mock('http://localhost/api/resources', 200, {delay: 1000});

  const request = withTimeout(500)(appy.request);

  const result = await request('http://localhost/api/resources')();

  expect(result).toEqual(
    left({
      type: 'RequestError',
      error: new AbortError(),
      input: [
        'http://localhost/api/resources',
        {signal: new AbortController().signal}
      ]
    })
  );
});

// --- Helpers
class AbortError extends Error {
  constructor(message: string = 'The operation was aborted.') {
    super(message);

    this.name = 'AbortError';
    this.message = message;
  }
}
