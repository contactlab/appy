/* eslint-disable no-console */

/**
 * 1. Execute randomly requests that fail
 * 2. and handle generated errors
 */

import 'cross-fetch/polyfill';

import * as E from 'fp-ts/lib/Either';
import {randomBool} from 'fp-ts/lib/Random';
import * as TE from 'fp-ts/lib/TaskEither';
import {pipe} from 'fp-ts/lib/pipeable';
import {withHeaders} from '../src/combinators/headers';
import {get} from '../src/index';

const requestWithResponseError = get('https://reqres.in/api/users/23'); // not found user...

const requestWithRequestError = pipe(
  get,
  withHeaders({'=': 'asdasd'}) // bad headers...
)('https://reqres.in/api/users');

const randomRequest = pipe(
  TE.rightIO(randomBool),
  TE.chain(b => (b ? requestWithResponseError : requestWithRequestError))
);

randomRequest().then(
  E.fold(
    err => {
      switch (err.type) {
        case 'RequestError':
          console.error('[TYPE ]', 'Request error');
          console.error('[ERROR]', err.error.message);
          console.debug('[DEBUG]', err.input);

          return;

        case 'ResponseError':
          const {status, statusText, url, headers} = err.response;

          console.error('[TYPE ]', 'Response error');
          console.error('[ERROR]', err.error.message);
          console.debug('[DEBUG]', {
            status,
            statusText,
            url,
            headers
          });

          return;
      }
    },
    resp => console.log(resp.data)
  )
);
