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
 * **Warning:** the merging logic had to be "reversed" because of the contravariant nature of `Reader` and because the execution of combinators is from right to left (_function composition_).
 *
 * This leads to a "weird" behavior for which the signal provided when `Req` is run wins over the one set with the combinator.
 *
 * So, for example, if we have:
 * ```ts
 * const controller1 = new AbortController();
 * const controller2 = new AbortController();
 *
 * const request = pipe(appy.get, withCancel(controller1));
 *
 * request(['http://some.endpoint', {signal: controller2.signal}])
 * ```
 * the `request` will be aborted only when **`controller2`** calls the `abort()` method.
 *
 * @since 3.1.0
 */

import * as RTE from 'fp-ts/ReaderTaskEither';
import * as TU from 'fp-ts/Tuple';
import {pipe} from 'fp-ts/function';
import {type Req, type Combinator, normalizeReqInput} from '../request';

/**
 * Sets `signal` on `Req` in order to make request cancellable through `AbortController`.
 *
 * Example:
 * ```ts
 * import {request} from '@contactlab/appy';
 * import {withCancel} from '@contactlab/appy/combinators/abort';
 * import {isLeft} from 'fp-ts/Either';
 * import {pipe} from 'fp-ts/function';
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
export const withCancel = (controller: AbortController): Combinator =>
  setSignal(controller.signal);

/**
 * Aborts the request if it does not respond within provided milliseconds.
 *
 * Example:
 * ```ts
 * import {request} from '@contactlab/appy';
 * import {withTimeout} from '@contactlab/appy/combinators/abort';
 * import {isLeft} from 'fp-ts/Either';
 * import {pipe} from 'fp-ts/function';
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
export const withTimeout =
  (millis: number) =>
  <A>(req: Req<A>): Req<A> => {
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

const setSignal = (signal: AbortSignal): Combinator =>
  RTE.local(input =>
    pipe(
      normalizeReqInput(input),
      // The "weird" merging is due to the mix of the contravariant nature of `Reader`
      // and the function composition at the base of "combinators".
      // Because combinators are applied from right to left, the merging has to be "reversed".
      // This leads to another "weird" behavior for which the signal provided when `Req` is run
      // wins over the one set with the combinator.
      TU.mapSnd(init => Object.assign({}, {signal}, init))
    )
  );
