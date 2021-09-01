import * as path from 'path';
import {sequenceT} from 'fp-ts/Apply';
import * as Arr from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import {parse, stringify} from 'fp-ts/Json';
import * as RTE from 'fp-ts/ReaderTaskEither';
import * as TE from 'fp-ts/TaskEither';
import {flow, pipe} from 'fp-ts/function';
import {FileSystem, fileSystemNode} from './helpers/fs';
import {Logger, loggerConsole} from './helpers/logger';
import {Program, run} from './helpers/program';

interface Capabilities extends FileSystem, Logger {}

interface AppEff<A> extends Program<Capabilities, A> {}

// --- Aliases
const parallel = sequenceT(RTE.ApplyPar);
const traverseTE = Arr.traverse(TE.ApplicativePar);

// --- CONSTANTS
const DIST = 'dist';
const FILES = ['.npmrc', 'CHANGELOG.md', 'LICENSE', 'README.md'];

// --- EFFECTS
const errMsg = flow(E.toError, e => e.message);

const copyFiles: AppEff<void[]> = C =>
  pipe(
    FILES,
    traverseTE(file =>
      pipe(
        C.info(`Copy "${file}" to ${DIST}`),
        TE.chain(() => C.copyFile(file, path.resolve(DIST, file)))
      )
    )
  );
const clonePkg: AppEff<void> = C =>
  pipe(
    C.info(`Clone "package.json" in ${DIST}`),
    TE.chain(() => C.readFile('package.json')),
    TE.chainEitherK(parsePkgJson),
    TE.chainEitherK(distPkgJson),
    TE.chain(content =>
      C.writeFile(path.resolve(DIST, 'package.json'), content)
    )
  );

const parsePkgJson = (data: string): E.Either<string, unknown> =>
  pipe(parse(data), E.mapLeft(errMsg));

const distPkgJson = (data: unknown): E.Either<string, string> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clone = Object.assign({}, data) as any;

  delete clone.files;
  delete clone.scripts;
  delete clone.jest;
  delete clone.husky;

  return pipe(stringify(clone), E.mapLeft(errMsg));
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
