import {isRight} from 'fp-ts/lib/Either';
import {TaskEither} from 'fp-ts/lib/TaskEither';

export const result = <E, A>(te: TaskEither<E, A>): Promise<A> =>
  te().then(r =>
    isRight(r) ? Promise.resolve(r.right) : Promise.reject(r.left)
  );
