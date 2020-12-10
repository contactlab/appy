import fetchMock from 'fetch-mock';
import {right, left} from 'fp-ts/lib/Either';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import {pipe} from 'fp-ts/lib/pipeable';
import * as D from 'io-ts/Decoder';
import {Decoder, toDecoder, withDecoder} from '../src/combinators/decoder';
import {withHeaders} from '../src/combinators/headers';
import * as appy from '../src/index';

afterEach(() => {
  fetchMock.reset();
});

test('withDecoder() should decodes `Resp` with provided decoder', async () => {
  const response = new Response('{"id": 1234, "name": "foo bar"}');
  fetchMock.mock('http://localhost/api/resources', response);

  const request = withDecoder(decoderOK)(appy.get);

  const result = await request('http://localhost/api/resources')();

  expect(result).toEqual(
    right({
      response,
      data: {id: 1234, name: 'foo bar'}
    })
  );

  expect(fetchMock.lastOptions()).toEqual({
    headers: {Accept: 'application/json'},
    method: 'GET'
  });
});

test('withDecoder() should respect other headers provided in pipeline', async () => {
  const response = new Response('{"id": 1234, "name": "foo bar"}');
  fetchMock.mock('http://localhost/api/resources', response);

  const request = pipe(
    appy.get,
    withHeaders({
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }),
    withDecoder(decoderOK)
  );

  await request('http://localhost/api/resources')();

  expect(fetchMock.lastOptions()).toEqual({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    method: 'GET'
  });
});

test('withDecoder() should decodes `Resp` with provided decoder - response data is empty string', async () => {
  const response = new Response('');
  fetchMock.mock('http://localhost/api/resources', response);

  const request = withDecoder(decoderOK)(appy.get);

  const result = await request('http://localhost/api/resources')();

  expect(result).toEqual(
    right({
      response,
      data: {}
    })
  );
});

test('withDecoder() should decodes `Resp` with provided decoder - response data is an object', async () => {
  const response = new Response();
  fetchMock.mock('http://localhost/api/resources', response);

  const request = pipe(
    appy.get,
    RTE.map(resp => ({
      response: resp.response,
      data: {id: 5678, name: 'THIS IS BAAAZ!'}
    })),
    withDecoder(decoderOK)
  );

  const result = await request('http://localhost/api/resources')();

  expect(result).toEqual(
    right({
      response,
      data: {id: 5678, name: 'THIS IS BAAAZ!'}
    })
  );
});

test('withDecoder() should decodes `Resp` with provided decoder - response data stringified', async () => {
  const response = new Response();
  fetchMock.mock('http://localhost/api/resources', response);

  const request = pipe(
    appy.get,
    RTE.map(resp => ({
      response: resp.response,
      data: 12345678
    })),
    withDecoder(decoderOK)
  );

  const result = await request('http://localhost/api/resources')();

  expect(result).toEqual(
    right({
      response,
      data: 12345678
    })
  );
});

test('withDecoder() should fail if response data cannot be parsed', async () => {
  const response = new Response('{some: "bad", json: true}');
  fetchMock.mock('http://localhost/api/resources', response);

  const request = withDecoder(decoderOK)(appy.get);

  const result = await request('http://localhost/api/resources')();

  expect(result).toEqual(
    left({
      type: 'ResponseError',
      error: new Error('Unexpected token s in JSON at position 1'),
      response
    })
  );
});

test('withDecoder() should fail if decoding fails', async () => {
  const response = new Response('{"id": 1234, "name": "foo bar"}');
  fetchMock.mock('http://localhost/api/resources', response);

  const request = withDecoder(decoderKO)(appy.get);

  const result = await request('http://localhost/api/resources')();

  expect(result).toEqual(
    left({
      type: 'ResponseError',
      error: new Error('decoding failed'),
      response
    })
  );
});

test('toDecoder() should convert a `GenericDecoder` into a `Decoder`', () => {
  const d = toDecoder(iotsPayload.decode, e => new Error(D.draw(e)));

  expect(d({id: 1234, name: 'foo bar', active: true})).toEqual(
    right({
      id: 1234,
      name: 'foo bar'
    })
  );

  expect(d({id: false})).toEqual(
    left(
      new Error(`required property "id"
└─ cannot decode false, should be number
required property "name"
└─ cannot decode undefined, should be string`)
    )
  );
});

// --- Helpers
interface Payload {
  id: number;
  name: string;
}

const decoderOK: Decoder<Payload> = u => {
  const p = u as Payload;
  return right(p);
};

const decoderKO: Decoder<Payload> = _ => left(new Error('decoding failed'));

const iotsPayload = D.type({
  id: D.number,
  name: D.string
});
