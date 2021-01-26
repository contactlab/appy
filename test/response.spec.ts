import {cloneResponse} from '../src/response';

test('cloneResponse() should clone `Response` setting provided content as body', async () => {
  // --- string
  const responseStr = cloneResponse(
    new Response('foo bar baz', {
      headers: {'Content-Type': 'text/plain'},
      status: 200,
      statusText: 'OK'
    }),
    'foo bar baz'
  );

  const txtStr = await responseStr.text();

  expect(txtStr).toBe('foo bar baz');
  expect(responseStr.headers).toEqual(
    new Headers({'Content-Type': 'text/plain'})
  );
  expect(responseStr.status).toBe(200);
  expect(responseStr.statusText).toBe('OK');

  // --- number
  const responseNum = cloneResponse(
    new Response('foo bar baz', {
      headers: new Headers({'Content-Type': 'text/plain'}),
      status: 200,
      statusText: 'OK'
    }),
    100
  );

  const txtNum = await responseNum.text();

  expect(txtNum).toBe('100');
  expect(responseNum.headers).toEqual(
    new Headers({'Content-Type': 'text/plain'})
  );
  expect(responseNum.status).toBe(200);
  expect(responseNum.statusText).toBe('OK');

  // --- boolean
  const responseBool = cloneResponse(
    new Response('foo bar baz', {
      status: 204,
      statusText: 'no content'
    }),
    true
  );

  const txtBool = await responseBool.text();

  expect(txtBool).toBe('true');
  expect(responseBool.status).toBe(204);
  expect(responseBool.statusText).toBe('no content');

  // --- JSON
  const responseJSON = cloneResponse(
    new Response('{"foo": "bar"}', {
      status: 500,
      statusText: 'Internal server error'
    }),
    {foo: 'bar'}
  );

  const json = await responseJSON.json();

  expect(json).toEqual({foo: 'bar'});
  expect(responseJSON.status).toBe(500);
  expect(responseJSON.statusText).toBe('Internal server error');
});

test('cloneResponse() should return an empty `Response` when provided content cannot be stringified', async () => {
  const response = cloneResponse(
    new Response('{"foo": "bar"}', {
      headers: {'Content-Type': 'text/plain'},
      status: 500,
      statusText: 'Internal server error'
    }),
    {foo: BigInt(1234)}
  );

  const txt = await response.text();

  expect(txt).toBe('');
  expect(response.headers).toEqual(new Headers({'Content-Type': 'text/plain'}));
  expect(response.status).toBe(500);
  expect(response.statusText).toBe('Internal server error');
});
