import * as E from 'fp-ts/lib/Either';
import * as t from './types';
import * as u from './util';

export interface Fetch {
  (input: RequestInfo, init?: RequestInit): Promise<Response>;
}

/**
 * Creates a request method using the passed in `fetch` function.
 *
 * The `data` in the returned `Resp` object is a `string` because the response's body can **always** be converted to text without error (via [`text()`](https://developer.mozilla.org/en-US/docs/Web/API/Body/text) method).
 *
 * Example:
 * ```ts
 * import {fetch} from 'cross-fetch';
 * import {makeRequest} from '@contactlab/appy';
 * import {fold} from 'fp-ts/lib/Either';
 *
 * const request = makeRequest(fetch);
 * const users = request('https://reqres.in/api/users');
 *
 * users().then(
 *   fold(
 *     err => console.error(err),
 *     data => console.log(data)
 *   )
 * );
 * ```
 *
 * @category creators
 * @since 3.2.0
 */
export function makeRequest(f: Fetch): t.Req<string> {
  return input => () => {
    const reqInput = u.normalizeReqInput(input);

    return f(...reqInput)
      .then(
        async response => {
          if (!response.ok) {
            throw u.toResponseError(
              new Error(
                `Request responded with status code ${response.status}`
              ),
              response
            );
          }

          const data = await response.text();

          return E.right({response, data});
        },
        e => {
          throw u.toRequestError(e, reqInput);
        }
      )
      .catch(e => E.left(e));
  };
}
