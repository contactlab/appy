import * as path from 'path';
import * as TE from 'fp-ts/lib/TaskEither';
import {pipe} from 'fp-ts/lib/pipeable';
import {Exec, execNode} from './helpers/exec';
import {Logger, loggerConsole} from './helpers/logger';
import {Program, run} from './helpers/program';

interface Capabilities extends Logger, Exec {}

interface AppEff<A> extends Program<Capabilities, A> {}

const withArgv = (args: string[]): string[] =>
  args.concat(process.argv.slice(2));

const main: AppEff<void> = C =>
  pipe(
    C.spawn('npm', withArgv(['publish']), {
      cwd: path.resolve('.', 'dist'),
      env: process.env
    }),
    TE.chain(() => C.log('package properly published'))
  );

run(
  main({
    ...loggerConsole,
    ...execNode
  })
);
