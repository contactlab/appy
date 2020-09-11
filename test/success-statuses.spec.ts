import fetchMock from 'fetch-mock';
import {right, left} from 'fp-ts/lib/Either';
import {withSuccessStatuses} from '../src/combinators/success-statuses';
import * as appy from '../src/index';

afterEach(() => {
  fetchMock.reset();
});

test('withSuccessStatuses() should let `Resp` with allowed status to go through', async () => {
  const response = new Response('{"errors": [{"title": "InvalidId"}]}', {
    status: 400
  });
  fetchMock.mock('http://localhost/api/resources', response);

  const request = withSuccessStatuses([400])(appy.get);

  const result = await request('http://localhost/api/resources')();

  expect(result).toEqual(
    right({
      response,
      data: '{"errors": [{"title": "InvalidId"}]}'
    })
  );
});

test('withSuccessStatuses() should fail if response status is not allowed', async () => {
  const response = new Response('{"errors": [{"title": "InvalidId"}]}', {
    status: 400
  });
  fetchMock.mock('http://localhost/api/resources', response);

  const request = withSuccessStatuses([])(appy.get);

  const result = await request('http://localhost/api/resources')();

  expect(result).toEqual(
    left({
      type: 'ResponseError',
      error: new Error('Request responded with status code 400'),
      response
    })
  );
});
