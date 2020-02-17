/* eslint-disable no-console */

/**
 * 1. Fetch a list of users with a simple request,
 * 2. take the first,
 * 3. update the user with name in upper-case
 * 4. and print the result
 */

import 'cross-fetch/polyfill';

import * as E from 'fp-ts/lib/Either';
import * as RTE from 'fp-ts/lib/TaskEither';
import {pipe} from 'fp-ts/lib/pipeable';
import {get, put} from '../src/index';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

interface Payload {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: User[];
}

const URL = 'https://reqres.in/api/users';

const parseResp = (data: string): Payload => JSON.parse(data); // this is not safe ;)

const request = pipe(
  get(URL),
  RTE.map(resp => parseResp(resp.data).data[0]),
  RTE.map(user => ({
    ...user,
    first_name: user.first_name.toUpperCase(),
    last_name: user.last_name.toUpperCase()
  })),
  RTE.chain(updated =>
    put([
      URL,
      {
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(updated)
      }
    ])
  )
);

request()
  .then(
    E.fold(
      err => console.error(err),
      resp => console.log(JSON.parse(resp.data))
    )
  )
  .catch(err => console.error('Unhandled error', err)); // in order to avoid Nodejs's DeprecationWarning
