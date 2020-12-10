import * as path from 'path';
import {sequenceT} from 'fp-ts/Apply';
import {array} from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import * as RTE from 'fp-ts/ReaderTaskEither';
import * as TE from 'fp-ts/TaskEither';
import {pipe} from 'fp-ts/function';
import {FileSystem, fileSystemNode} from './helpers/fs';
import {Logger, loggerConsole} from './helpers/logger';
import {Eff, Program, run} from './helpers/program';

interface Capabilities extends FileSystem, Logger {}

interface AppEff<A> extends Program<Capabilities, A> {}

// --- Aliases
const parallel = sequenceT(RTE.readerTaskEither);
const traverseTE = array.traverse(TE.taskEither);

// --- CONSTANTS
const DIST = 'dist';
const FILES = ['.npmrc', 'CHANGELOG.md', 'LICENSE', 'README.md'];

// --- EFFECTS
const copyFiles: AppEff<void[]> = C =>
  traverseTE(FILES, file =>
    pipe(
      C.info(`Copy "${file}" to ${DIST}`),
      TE.chain(() => C.copyFile(file, path.resolve(DIST, file)))
    )
  );

const clonePkg: AppEff<void> = C =>
  pipe(
    C.info(`Clone "package.json" in ${DIST}`),
    TE.chain(() => C.readFile('package.json')),
    TE.chain(parsePkgJson),
    TE.chain(distPkgJson),
    TE.chain(content =>
      C.writeFile(path.resolve(DIST, 'package.json'), content)
    )
  );

const parsePkgJson = (data: string): Eff<unknown> =>
  pipe(
    E.parseJSON(data, E.toError),
    E.mapLeft(e => e.message),
    TE.fromEither
  );

const distPkgJson = (data: unknown): Eff<string> => {
  const clone = Object.assign({}, data) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  delete clone.files;
  delete clone.scripts;
  delete clone.jest;
  delete clone.husky;

  return pipe(
    E.stringifyJSON(clone, E.toError),
    E.mapLeft(e => e.message),
    TE.fromEither
  );
};

// --- PROGRAM
const main: AppEff<void> = pipe(
  parallel(copyFiles, clonePkg),
  RTE.chain(() => C => C.log(`"${DIST}" prepared for distribution`))
);

// --- RUN
run(
  main({
    ...fileSystemNode,
    ...loggerConsole
  })
);
