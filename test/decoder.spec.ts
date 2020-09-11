import fetchMock from 'fetch-mock';
import {right, left} from 'fp-ts/lib/Either';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import {pipe} from 'fp-ts/lib/pipeable';
import * as t from 'io-ts';
import {failure} from 'io-ts/lib/PathReporter';
import {Decoder, toDecoder, withDecoder} from '../src/combinators/decoder';
import * as appy from '../src/index';

afterEach(() => {
  fetchMock.reset();
});

test('withDecoder() should decode `Resp` with provided decoder', async () => {
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
});

test('withDecoder() should decode `Resp` with provided decoder - response data is empty string', async () => {
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
      data: {
        status: 200,
        data: {id: 5678, name: 'THIS IS BAAAZ!'}
      }
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
  const d = toDecoder(
    iotsPayload.decode,
    e => new Error(failure(e).join('\n'))
  );

  expect(
    d({status: 200, data: {id: 1234, name: 'foo bar', active: true}})
  ).toEqual(
    right({
      status: 200,
      data: {
        id: 1234,
        name: 'foo bar',
        active: true
      }
    })
  );

  expect(d({status: 200, data: {id: false}})).toEqual(
    left(
      new Error(
        `Invalid value false supplied to : Payload/data: { id: number, name: string }/id: number
Invalid value undefined supplied to : Payload/data: { id: number, name: string }/name: string`
      )
    )
  );
});

// --- Helpers
interface Payload {
  status: 200;
  data: {id: number; name: string};
}

const decoderOK: Decoder<Payload> = u => {
  const p = u as Payload;
  return right(p);
};

const decoderKO: Decoder<Payload> = _ => left(new Error('decoding failed'));

const iotsPayload = t.type(
  {
    status: t.literal(200),
    data: t.type({
      id: t.number,
      name: t.string
    })
  },
  'Payload'
);
