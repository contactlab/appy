import fetchMock from 'fetch-mock';
import {left} from 'fp-ts/lib/Either';
import {withHeaders} from '../src/combinators/headers';
import * as appy from '../src/index';

afterEach(() => {
  fetchMock.reset();
});

test('withHeaders() should set provided headers on `Req`', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const request = withHeaders({'Content-Type': 'application/json'})(
    appy.request
  );

  await request('http://localhost/api/resources')();

  expect(fetchMock.lastOptions()).toEqual({
    headers: new Headers({'Content-Type': 'application/json'})
  });
});

test('withHeaders() should merge provided headers with `Req` ones', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const request = withHeaders({'Content-Type': 'application/json'})(appy.get);

  await request([
    'http://localhost/api/resources',
    {
      headers: {
        Authorization: 'Bearer TOKEN',
        'Content-Type': 'text/html'
      }
    }
  ])();

  expect(fetchMock.lastOptions()).toEqual({
    headers: new Headers({
      'Content-Type': 'application/json',
      Authorization: 'Bearer TOKEN'
    }),
    method: 'GET'
  });
});

test('withHeaders() should merge provided headers with `Req` ones - as Headers object', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const request = withHeaders(headers)(appy.request);

  await request('http://localhost/api/resources')();

  expect(fetchMock.lastOptions()).toEqual({headers});
});

test('withHeaders() should merge provided headers with `Req` ones - as array of strings', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const headers = [['Content-Type', 'application/json']];
  const request = withHeaders(headers)(appy.request);

  await request('http://localhost/api/resources')();

  expect(fetchMock.lastOptions()).toEqual({
    headers: new Headers({'Content-Type': 'application/json'})
  });
});

test('withHeaders() should fail if provided headers has forbidden name', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const request = withHeaders({'=': 'asdasd'})(appy.request);

  const result = await request('http://localhost/api/resources')();

  expect(result).toEqual(
    left({
      type: 'RequestError',
      error: new TypeError('= is not a legal HTTP header name'),
      input: ['http://localhost/api/resources', {}]
    })
  );

  expect(fetchMock.called()).toBe(false);
});
