/* eslint-disable no-console */

/**
 * 1. Create a new user
 * 2. and print the result as json
 */

import 'cross-fetch/polyfill';

import * as E from 'fp-ts/Either';
import {pipe} from 'fp-ts/function';
import {withBody} from '../src/combinators/body';
import {withHeaders} from '../src/combinators/headers';
import {post} from '../src/index';

/**
 * This is the same as:
 * ```
 * post([
 *  'https://reqres.in/api/users',
 *  {
 *    headers: {'Content-Type': 'application/json'},
 *    body: JSON.stringify({first_name: 'Foo', last_name: 'Bar'})
 *  }
 * ```
 */
const request = pipe(
  post,
  withHeaders({'Content-Type': 'application/json'}),
  withBody({first_name: 'Foo', last_name: 'Bar'})
)('https://reqres.in/api/users');

request()
  .then(
    E.fold(
      err => console.error(err),
      resp => console.log(JSON.parse(resp.data))
    )
  )
  .catch(err => console.error('Unhandled error', err)); // in order to avoid Nodejs's DeprecationWarning
