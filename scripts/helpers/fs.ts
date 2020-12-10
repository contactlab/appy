import * as fs from 'fs';
import {mapLeft, taskify} from 'fp-ts/TaskEither';
import {flow, pipe} from 'fp-ts/function';
import Glob from 'glob';
import {Eff} from './program';

export interface FileSystem {
  readonly readFile: (path: string) => Eff<string>;
  readonly writeFile: (path: string, content: string) => Eff<void>;
  readonly copyFile: (from: string, to: string) => Eff<void>;
  readonly glob: (pattern: string) => Eff<string[]>;
}

const readFileTE = taskify<fs.PathLike, string, NodeJS.ErrnoException, string>(
  fs.readFile
);
const writeFileTE = taskify<fs.PathLike, string, NodeJS.ErrnoException, void>(
  fs.writeFile
);
const copyFileTE = taskify<
  fs.PathLike,
  fs.PathLike,
  NodeJS.ErrnoException,
  void
>(fs.copyFile);
const globTE = taskify<string, Error, string[]>(Glob);
const toError = (e: Error): string => e.message;

export const fileSystemNode: FileSystem = {
  readFile: path => pipe(readFileTE(path, 'utf8'), mapLeft(toError)),

  writeFile: flow(writeFileTE, mapLeft(toError)),

  copyFile: flow(copyFileTE, mapLeft(toError)),

  glob: pattern => pipe(globTE(pattern), mapLeft(toError))
};
