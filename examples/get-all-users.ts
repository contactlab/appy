/* eslint-disable no-console */

/**
 * 1. Recursively fetch users until reaches the last page
 * 2. and print the result as json
 */

import 'cross-fetch/polyfill';

import * as E from 'fp-ts/Either';
import * as RTE from 'fp-ts/ReaderTaskEither';
import {pipe} from 'fp-ts/function';
import * as D from 'io-ts/Decoder';
import {Decoder, toDecoder, withDecoder} from '../src/combinators/decoder';
import {withUrlParams} from '../src/combinators/url-params';
import {get, Req, Resp} from '../src/index';

// --- io-ts land
interface User extends D.TypeOf<typeof User> {}
const User = D.struct({
  id: D.number,
  email: D.string,
  first_name: D.string,
  last_name: D.string,
  avatar: D.string
});

interface Payload extends D.TypeOf<typeof Payload> {}
const Payload = D.struct({
  page: D.number,
  per_page: D.number,
  total: D.number,
  total_pages: D.number,
  data: D.array(User)
});

const fromIots = <A>(d: D.Decoder<unknown, A>): Decoder<A> =>
  toDecoder(d.decode, e => new Error(D.draw(e)));
// ---

const getUsersPaginated = (page: number): Req<Payload> =>
  pipe(
    get,
    withUrlParams({page: String(page)}),
    withDecoder(fromIots(Payload))
  );

const getTheRest = (resp: Resp<Payload>, users: User[] = []): Req<User[]> => {
  const {data, page, total_pages} = resp.data; // eslint-disable-line camelcase
  const total = users.concat(data);

  return page === total_pages // eslint-disable-line camelcase
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
