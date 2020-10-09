import fetchMock from 'fetch-mock';
import {withUrlParams} from '../src/combinators/url-params';
import * as appy from '../src/index';

afterEach(() => {
  fetchMock.reset();
});

test('withUrlParams() should add provided query params to `Req` input', async () => {
  fetchMock.mock('begin:http://localhost/api/resources', 200);

  const request = withUrlParams({
    foo: 'bar',
    baz: String(null),
    asdf: String(true),
    ghjk: String(1234)
  })(appy.request);

  await request('http://localhost/api/resources')();

  expect(fetchMock.lastUrl()).toBe(
    'http://localhost/api/resources?foo=bar&baz=null&asdf=true&ghjk=1234'
  );
});

test('withUrlParams() should add provided query params to `Req` input - multiple calls', async () => {
  fetchMock.mock('begin:http://localhost/api/resources', 200);

  const request = withUrlParams({
    foo: 'bar',
    baz: String(null),
    asdf: String(true),
    ghjk: String(1234)
  })(appy.request);

  await request('http://localhost/api/resources')();

  expect(fetchMock.lastUrl()).toBe(
    'http://localhost/api/resources?foo=bar&baz=null&asdf=true&ghjk=1234'
  );
});

test('withUrlParams() should merge provided query params with `Req` input ones', async () => {
  fetchMock.mock('begin:http://localhost/api/resources', 200);

  const request = withUrlParams({
    foo: 'bar',
    baz: String(null),
    asdf: String(true),
    ghjk: String(1234)
  })(appy.request);

  await request('http://localhost/api/resources?foo=BARBAR&zxcv=42&baz=true')();

  expect(fetchMock.lastUrl()).toBe(
    'http://localhost/api/resources?foo=bar&zxcv=42&baz=null&asdf=true&ghjk=1234'
  );
});
