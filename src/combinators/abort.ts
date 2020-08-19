/**
 * `abort` combinators: cancel requests via `AbortController`.
 *
 * **About `AbortController` compatibility**
 *
 * [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) is an experimental technology defined in the current DOM specification.
 *
 * Thus, it is not supported by [old browsers](https://caniuse.com/#search=AbortController) (e.g. IE11) and Nodejs environments.
 *
 * We suggest you to use a polyfill (check out the [`_setup.ts`](https://github.com/contactlab/appy/blob/master/test/_setup.ts) file in the test folder) like:
 *
 * - [abort-controller](https://www.npmjs.com/package/abort-controller)
 * - [abortcontroller-polyfill](https://www.npmjs.com/package/abortcontroller-polyfill)
 *
 * @since 3.1.0
 */

import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as TU from 'fp-ts/lib/Tuple';
import {pipe} from 'fp-ts/lib/pipeable';
import {Req, normalizeReqInput} from '../index';

/**
 * Sets `signal` on `Req` in order to make request cancellable through `AbortController`.
 *
 * Example:
 * ```ts
 * import {request} from '@contactlab/appy';
 * import {withCancel} from '@contactlab/appy/combinators/abort';
 * import {isLeft} from 'fp-ts/lib/Either';
 * import {pipe} from 'fp-ts/lib/pipeable';
 *
 * const controller = new AbortController();
 *
 * const requestWithCancel = pipe(request, withCancel(controller));
 * const users = requestWithCancel('https://reqres.in/api/users');
 *
 * controller.abort();
 *
 * users().then(result => {
 *   assert.ok(isLeft(result))
 * });
 * ```
 *
 * @category combinators
 * @since 3.1.0
 */
export function withCancel<A>(
  controller: AbortController
): (req: Req<A>) => Req<A> {
  return setSignal(controller.signal);
}

/**
 * Aborts the request if it does not respond within provided milliseconds.
 *
 * Example:
 * ```ts
 * import {request} from '@contactlab/appy';
 * import {withTimeout} from '@contactlab/appy/combinators/abort';
 * import {isLeft} from 'fp-ts/lib/Either';
 * import {pipe} from 'fp-ts/lib/pipeable';
 *
 * const requestWithTimeout = pipe(request, withTimeout(500));
 * const users = requestWithTimeout('https://reqres.in/api/users');
 *
 * users().then(result => {
 *   assert.ok(isLeft(result)) // <-- because timeout is really small
 * });
 * ```
 *
 * @category combinators
 * @since 3.1.0
 */
export function withTimeout<A>(millis: number): (req: Req<A>) => Req<A> {
  return req => {
    const controller = new AbortController();

    return pipe(
      // --- First of all we start the timeout as an `IO` (weird... but we need a `timeoutID`)
      RTE.rightIO(() => setTimeout(() => controller.abort(), millis)),
      // --- Then we make the request with the `AbortController` driven by the timeout
      RTE.chain(timeoutID =>
        pipe(
          req,
          withCancel(controller),
          // --- Finally we clear the timeout when we get a response
          RTE.chainFirst(() => RTE.rightIO(() => clearTimeout(timeoutID)))
        )
      )
    );
  };
}

function setSignal<A>(signal: AbortSignal): (req: Req<A>) => Req<A> {
  return RTE.local(input =>
    pipe(
      normalizeReqInput(input),
      TU.mapLeft(init => ({...init, signal}))
    )
  );
}
