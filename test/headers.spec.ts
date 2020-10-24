import fetchMock from 'fetch-mock';
import {left} from 'fp-ts/lib/Either';
import {pipe} from 'fp-ts/lib/pipeable';
import {withHeaders} from '../src/combinators/headers';
import {get} from '../src/index';

const f = fetch as fetchMock.FetchMockSandbox;

afterEach(() => {
  f.reset();
});

test('withHeaders() should set provided headers on `Req`', async () => {
  f.mock('http://localhost/api/resources', 200);

  const request = withHeaders({'Content-Type': 'application/json'})(get);

  await request('http://localhost/api/resources')();

  expect(f.lastOptions()).toEqual({
    headers: {'Content-Type': 'application/json'},
    method: 'GET'
  });
});

test('withHeaders() should merge provided headers with `Req` ones - but `Req` wins', async () => {
  f.mock('http://localhost/api/resources', 200);

  const request = withHeaders({
    Authorization: 'Bearer TOKEN',
    'Content-Type': 'application/json'
  })(get);

  await request([
    'http://localhost/api/resources',
    {headers: {'Content-Type': 'text/html'}}
  ])();

  expect(f.lastOptions()).toEqual({
    headers: {
      'Content-Type': 'text/html',
      Authorization: 'Bearer TOKEN'
    },
    method: 'GET'
  });
});

test('withHeaders() should merge provided headers with `Req` ones - multiple calls', async () => {
  f.mock('http://localhost/api/resources', 200);

  const request = pipe(
    get,
    withHeaders({'Content-Type': 'text/html'}),
    withHeaders({'Content-Type': 'application/json'})
  );

  await request([
    'http://localhost/api/resources',
    {headers: {Authorization: 'Bearer TOKEN'}}
  ])();

  expect(f.lastOptions()).toEqual({
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer TOKEN'
    },
    method: 'GET'
  });
});

test('withHeaders() should merge provided headers with `Req` ones - as Headers object', async () => {
  f.mock('http://localhost/api/resources', 200);

  const headers = new Headers({'Content-Type': 'application/json'});

  const request = withHeaders(headers)(get);

  await request([
    'http://localhost/api/resources',
    {headers: {Authorization: 'Bearer TOKEN'}}
  ])();

  expect(f.lastOptions()).toEqual({
    headers: {
      'content-type': 'application/json', // <-- because Headers keys are case-insensitive...
      Authorization: 'Bearer TOKEN'
    },
    method: 'GET'
  });
});

test('withHeaders() should merge provided headers with `Req` ones - as array of strings', async () => {
  f.mock('http://localhost/api/resources', 200);

  const headers = [['Content-Type', 'application/json']];
  const request = withHeaders(headers)(get);

  await request([
    'http://localhost/api/resources',
    {headers: {Authorization: 'Bearer TOKEN'}}
  ])();

  expect(f.lastOptions()).toEqual({
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer TOKEN'
    },
    method: 'GET'
  });
});

test('withHeaders() should fail if provided headers has forbidden name', async () => {
  const error = new TypeError('= is not a legal HTTP header name');

  f.mock('http://localhost/api/resources', {throws: error});

  const request = withHeaders({'=': 'asdasd'})(get);

  const result = await request('http://localhost/api/resources')();

  expect(result).toEqual(
    left({
      type: 'RequestError',
      error: new TypeError('= is not a legal HTTP header name'),
      input: [
        'http://localhost/api/resources',
        {
          headers: {'=': 'asdasd'},
          method: 'GET'
        }
      ]
    })
  );
});
