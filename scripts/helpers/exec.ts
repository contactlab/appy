import * as childProcess from 'child_process';
import * as E from 'fp-ts/Either';
import {Eff} from './program';

export interface Exec {
  readonly spawn: (
    cmd: string,
    args: string[],
    opts?: childProcess.SpawnOptions
  ) => Eff<void>;
}

export const execNode: Exec = {
  spawn: (cmd, args, opts) => () =>
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
    })
};
