import fetchMock from 'fetch-mock';
import {left} from 'fp-ts/lib/Either';
import {withBody} from '../src/combinators/body';
import * as appy from '../src/index';

afterEach(() => {
  fetchMock.reset();
});

test('withBody() should set provided JSON body on `Req` (stringified)', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const body = {id: 123, name: 'foo bar'};
  const request = withBody(body)(appy.post);

  await request('http://localhost/api/resources')();

  expect(fetchMock.lastOptions()).toEqual({
    body: JSON.stringify(body),
    method: 'POST'
  });
});

test('withBody() should fail if provided JSON body throws error when stringified', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const body = {} as any;
  body.itself = body;
  const request = withBody(body)(appy.post);

  const result = await request('http://localhost/api/resources')();

  expect(result).toEqual(
    left({
      type: 'RequestError',
      error: new TypeError('Converting circular structure to JSON'),
      input: ['http://localhost/api/resources', {}]
    })
  );

  expect(fetchMock.called()).toBe(false);
});

test('withBody() should set provided body on `Req` - string', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const body = '{id: 123, name: "foo bar"}';
  const request = withBody(body)(appy.post);

  await request('http://localhost/api/resources')();

  expect(fetchMock.lastOptions()).toEqual({
    body,
    method: 'POST'
  });
});

test('withBody() should set provided body on `Req` - Blob', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const body = new Blob(['{id: 123, name: "foo bar"}']);
  const request = withBody(body)(appy.post);

  await request('http://localhost/api/resources')();

  expect(fetchMock.lastOptions()).toEqual({
    body,
    method: 'POST'
  });
});

test('withBody() should set provided body on `Req` - FormData', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const body = new FormData();
  body.set('id', '123');
  body.set('name', 'foo bar');

  const request = withBody(body)(appy.post);

  await request('http://localhost/api/resources')();

  expect(fetchMock.lastOptions()).toEqual({
    body,
    method: 'POST'
  });
});

test('withBody() should set provided body on `Req` - URLSearchParams', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const body = new URLSearchParams();
  body.set('id', '123');
  body.set('name', 'foo bar');

  const request = withBody(body)(appy.post);

  await request('http://localhost/api/resources')();

  expect(fetchMock.lastOptions()).toEqual({
    body,
    method: 'POST'
  });
});
