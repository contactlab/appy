import * as childProcess from 'child_process';
import * as path from 'path';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import {pipe} from 'fp-ts/lib/pipeable';
import {Logger, loggerConsole} from './helpers/logger';
import {Program, run} from './helpers/program';

interface Capabilities extends Logger {}

interface AppEff<A> extends Program<Capabilities, A> {}

const withArgv = (args: string[]): string[] =>
  args.concat(process.argv.slice(2));

const spawn = (
  cmd: string,
  args: string[],
  opts?: childProcess.SpawnOptions
): TE.TaskEither<string, void> => () =>
  new Promise(resolve => {
    let exited = false;

    const options: childProcess.SpawnOptions = {
      stdio: 'inherit',
      ...opts
    };

    const subprocess = childProcess.spawn(cmd, args, options);

    subprocess.on('exit', code => {
      if (exited) {
        return;
      }

      exited = true;

      if (code === null || code > 0) {
        return resolve(E.left(`Process exited with code ${code}`));
      }

      return resolve(E.right(undefined));
    });

    subprocess.on('error', err => {
      if (exited) {
        return;
      }

      exited = true;

      return resolve(E.left(err.message));
    });
  });

const main: AppEff<void> = C =>
  pipe(
    spawn('npm', withArgv(['publish']), {
      cwd: path.resolve('.', 'dist'),
      env: process.env
    }),
    TE.chain(() => C.log('package properly published'))
  );

run(
  main({
    ...loggerConsole
  })
);
