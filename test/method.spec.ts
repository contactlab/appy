import fetchMock from 'fetch-mock';
import {pipe} from 'fp-ts/lib/pipeable';
import {withMethod} from '../src/combinators/method';
import {request} from '../src/index';

afterEach(() => {
  fetchMock.reset();
});

test('withMethod() should set provided method on `Req`', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const r = withMethod('POST')(request);

  await r('http://localhost/api/resources')();

  expect(fetchMock.lastOptions()).toEqual({method: 'POST'});
});

test('withMethod() should set provided method on `Req` - but `Req` wins', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const r = withMethod('POST')(request);

  await r(['http://localhost/api/resources', {method: 'PUT'}])();

  expect(fetchMock.lastOptions()).toEqual({
    method: 'PUT'
  });
});

test('withMethod() should set provided method on `Req` - multiple calls', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const r = pipe(request, withMethod('POST'), withMethod('PATCH'));

  await r([
    'http://localhost/api/resources',
    {headers: {Authorization: 'Bearer TOKEN'}}
  ])();

  expect(fetchMock.lastOptions()).toEqual({
    headers: {Authorization: 'Bearer TOKEN'},
    method: 'PATCH'
  });
});
