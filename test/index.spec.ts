import fetchMock from 'fetch-mock';
import {right} from 'fp-ts/Either';
import * as appy from '../src/index';

afterEach(() => {
  fetchMock.reset();
});

test('get() should run a GET request', async () => {
  const response = new Response('a list of resources');

  fetchMock.mock('http://localhost/api/resources', response);

  const r = await appy.get('http://localhost/api/resources')();

  expect(r).toEqual(right({response, data: 'a list of resources'}));

  expect(fetchMock.called('http://localhost/api/resources', 'GET')).toBe(true);
});

test('post() should run a POST request', async () => {
  const response = new Response('a list of resources');

  fetchMock.mock('http://localhost/api/resources', response);

  const r = await appy.post([
    'http://localhost/api/resources',
    {body: 'foo'}
  ])();

  expect(r).toEqual(right({response, data: 'a list of resources'}));

  expect(fetchMock.called('http://localhost/api/resources', 'POST')).toBe(true);
});

test('put() should run a PUT request', async () => {
  const response = new Response('a list of resources');

  fetchMock.mock('http://localhost/api/resources', response);

  const r = await appy.put(['http://localhost/api/resources', {body: 'foo'}])();

  expect(r).toEqual(right({response, data: 'a list of resources'}));

  expect(fetchMock.called('http://localhost/api/resources', 'PUT')).toBe(true);
});

test('patch() should run a PATCH request', async () => {
  const response = new Response('a list of resources');

  fetchMock.mock('http://localhost/api/resources', response);

  const r = await appy.patch([
    'http://localhost/api/resources',
    {body: 'foo'}
  ])();

  expect(r).toEqual(right({response, data: 'a list of resources'}));

  expect(fetchMock.called('http://localhost/api/resources', 'PATCH')).toBe(
    true
  );
});

test('del() should run a DELETE request', async () => {
  const response = new Response('');

  fetchMock.mock('http://localhost/api/resources', response);

  const r = await appy.del('http://localhost/api/resources')();

  expect(r).toEqual(right({response, data: ''}));

  expect(fetchMock.called('http://localhost/api/resources', 'DELETE')).toBe(
    true
  );
});
