/* eslint-disable no-console */

/**
 * 1. Fetch a list of users with a simple request
 * 2. and print the result as json
 */

import 'cross-fetch/polyfill';

import * as E from 'fp-ts/lib/Either';
import {get} from '../src/index';

/**
 * Because `fetch` default HTTP method is 'GET'
 * this is the same as:
 * `request('https://reqres.in/api/users')`
 * or
 * `request(['https://reqres.in/api/users', {method: 'GET'}])`
 */
const request = get('https://reqres.in/api/users');

request()
  .then(
    E.fold(
      err => console.error(err),
      resp => console.log(JSON.parse(resp.data))
    )
  )
  .catch(err => console.error('Unhandled error', err)); // in order to avoid Nodejs's DeprecationWarning
