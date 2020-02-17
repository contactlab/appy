/* eslint-disable no-console */

/**
 * 1. Recursively fetch users until reaches the last page
 * 2. and print the result as json
 */

import 'cross-fetch/polyfill';

import * as E from 'fp-ts/lib/Either';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import {pipe} from 'fp-ts/lib/pipeable';
import * as t from 'io-ts';
import {failure} from 'io-ts/lib/PathReporter';
import {Decoder, toDecoder, withDecoder} from '../src/combinators/decoder';
import {withUrlParams} from '../src/combinators/url-params';
import {get, Req, Resp} from '../src/index';

// --- io-ts land
interface User extends t.TypeOf<typeof User> {}
const User = t.type(
  {
    id: t.number,
    email: t.string,
    first_name: t.string,
    last_name: t.string,
    avatar: t.string
  },
  'User'
);

interface Payload extends t.TypeOf<typeof Payload> {}
const Payload = t.type(
  {
    page: t.number,
    per_page: t.number,
    total: t.number,
    total_pages: t.number,
    data: t.array(User)
  },
  'API Payload'
);

const fromIots = <A>(d: t.Decoder<unknown, A>): Decoder<A> =>
  toDecoder(d.decode, e => new Error(failure(e).join('\n')));
// ---

const getUsersPaginated = (page: number): Req<Payload> =>
  pipe(
    get,
    withUrlParams({page: String(page)}),
    withDecoder(fromIots(Payload))
  );

const getTheRest = (resp: Resp<Payload>, users: User[] = []): Req<User[]> => {
  const {data, page, total_pages} = resp.data; // eslint-disable-line @typescript-eslint/camelcase
  const total = users.concat(data);

  return page === total_pages // eslint-disable-line @typescript-eslint/camelcase
    ? RTE.right({...resp, data: total})
    : pipe(
        getUsersPaginated(page + 1),
        RTE.chain(r => getTheRest(r, total))
      );
};

const request = pipe(
  getUsersPaginated(1),
  RTE.chain(getTheRest)
)('https://reqres.in/api/users');

request()
  .then(
    E.fold(
      err => console.error(err),
      users => console.log(users)
    )
  )
  .catch(err => console.error('Unhandled error', err)); // in order to avoid Nodejs's DeprecationWarning
