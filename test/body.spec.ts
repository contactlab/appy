import fetchMock from 'fetch-mock';
import {left, mapLeft} from 'fp-ts/lib/Either';
import {pipe} from 'fp-ts/lib/pipeable';
import {withBody} from '../src/combinators/body';
import {post} from '../src/index';

afterEach(() => {
  fetchMock.reset();
});

test('withBody() should set provided JSON body on `Req` (stringified)', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const body = {id: 123, name: 'foo bar'};
  const request = withBody(body)(post);

  await request('http://localhost/api/resources')();

  expect(fetchMock.lastOptions()).toEqual({
    body: JSON.stringify(body),
    method: 'POST'
  });
});

test('withBody() should set provided JSON body on `Req` (stringified) - multiple calls', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const body1 = {id: 123, name: 'foo bar'};
  const body2 = {id: 456, name: 'baz aaa'};
  const request = pipe(post, withBody(body1), withBody(body2));

  await request('http://localhost/api/resources')();

  expect(fetchMock.lastOptions()).toEqual({
    body: JSON.stringify(body2),
    method: 'POST'
  });
});

test('withBody() should set provided JSON body on `Req` (stringified) - but `Req` wins', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const body1 = {id: 123, name: 'foo bar'};
  const body2 = {id: 456, name: 'baz aaa'};
  const request = withBody(body1)(post);

  await request([
    'http://localhost/api/resources',
    {body: JSON.stringify(body2)}
  ])();

  expect(fetchMock.lastOptions()).toEqual({
    body: JSON.stringify(body2),
    method: 'POST'
  });
});

test('withBody() should fail if provided JSON body throws error when stringified', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const body = {} as any;
  body.itself = body;
  const request = withBody(body)(post);

  const result = await request('http://localhost/api/resources')();

  // --- Use this trick because Nodejs error messages are different in v10 and v12
  const check = pipe(
    result,
    mapLeft(e => ({
      ...e,
      error:
        e.error instanceof TypeError &&
        e.error.message.includes('Converting circular structure to JSON')
    }))
  );

  expect(check).toEqual(
    left({
      type: 'RequestError',
      error: true,
      input: ['http://localhost/api/resources', {}]
    })
  );

  expect(fetchMock.called()).toBe(false);
});

test('withBody() should set provided body on `Req` - string', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const body = '{id: 123, name: "foo bar"}';
  const request = withBody(body)(post);

  await request('http://localhost/api/resources')();

  expect(fetchMock.lastOptions()).toEqual({
    body,
    method: 'POST'
  });
});

test('withBody() should set provided body on `Req` - Blob', async () => {
  fetchMock.mock('http://localhost/api/resources', 200);

  const body = new Blob(['{id: 123, name: "foo bar"}']);
  const request = withBody(body)(post);

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

  const request = withBody(body)(post);

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

  const request = withBody(body)(post);

  await request('http://localhost/api/resources')();

  expect(fetchMock.lastOptions()).toEqual({
    body,
    method: 'POST'
  });
});
