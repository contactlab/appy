import fetchMock from 'fetch-mock';
import {pipe} from 'fp-ts/lib/pipeable';
import {withUrlParams} from '../src/combinators/url-params';
import * as appy from '../src/index';

const f = fetch as fetchMock.FetchMockSandbox;

afterEach(() => {
  f.reset();
});

test('withUrlParams() should add provided query params to `Req` input', async () => {
  f.mock('begin:http://localhost/api/resources', 200);

  const request = withUrlParams({
    foo: 'bar',
    baz: String(null),
    asdf: String(true),
    ghjk: String(1234)
  })(appy.request);

  await request('http://localhost/api/resources')();

  expect(f.lastUrl()).toBe(
    'http://localhost/api/resources?foo=bar&baz=null&asdf=true&ghjk=1234'
  );
});

test('withUrlParams() should add provided query params to `Req` input - multiple calls', async () => {
  f.mock('begin:http://localhost/api/resources', 200);

  const request = pipe(
    appy.request,
    withUrlParams({
      foo: 'bar',
      baz: String(null),
      asdf: String(true),
      ghjk: String(1234)
    }),
    withUrlParams({
      foo: 'baz',
      baz: String(null),
      asdf: String(false),
      ghjk: String(5678)
    })
  );

  await request('http://localhost/api/resources')();

  expect(f.lastUrl()).toBe(
    'http://localhost/api/resources?foo=baz&baz=null&asdf=false&ghjk=5678'
  );
});

test('withUrlParams() should merge provided query params with `Req` input ones - but `Req` wins', async () => {
  f.mock('begin:http://localhost/api/resources', 200);

  const request = withUrlParams({
    foo: 'bar',
    baz: String(null),
    asdf: String(true),
    ghjk: String(1234)
  })(appy.request);

  await request('http://localhost/api/resources?foo=BARBAR&zxcv=42&baz=true')();

  expect(f.lastUrl()).toBe(
    'http://localhost/api/resources?foo=BARBAR&baz=true&asdf=true&ghjk=1234&zxcv=42'
  );
});
