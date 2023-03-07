import chalk from 'chalk';
import * as E from 'fp-ts/Either';
import * as RTE from 'fp-ts/ReaderTaskEither';
import * as TE from 'fp-ts/TaskEither';

export interface Eff<A> extends TE.TaskEither<string, A> {}

export interface Program<C, A> extends RTE.ReaderTaskEither<C, string, A> {}

export function run<A>(eff: Eff<A>): void {
  eff()
    .then(
      E.fold(
        e => {
          throw e;
        },
        _ => {
          process.exitCode = 0;
        }
      )
    )
    .catch(e => {
      console.error(chalk.red('[ERROR]', e)); // eslint-disable-line no-console

      process.exitCode = 1;
    });
}
