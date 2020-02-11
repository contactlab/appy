import * as path from 'path';
import {sequenceT} from 'fp-ts/lib/Apply';
import * as E from 'fp-ts/lib/Either';
import {chain, readerTaskEither} from 'fp-ts/lib/ReaderTaskEither';
import * as TE from 'fp-ts/lib/TaskEither';
import {pipe} from 'fp-ts/lib/pipeable';
import {FileSystem, fileSystemNode} from './helpers/fs';
import {Logger, loggerConsole} from './helpers/logger';
import {Eff, Program, run} from './helpers/program';

interface Capabilities extends FileSystem, Logger {}

interface AppEff<A> extends Program<Capabilities, A> {}

// --- Aliases
const parallel = sequenceT(readerTaskEither);

// --- CONSTANTS
const DIST = 'dist';

// --- EFFECTS
const copyNpmrc: AppEff<void> = C =>
  pipe(
    C.info(`Copy ".npmrc" file to ${DIST}`),
    TE.chain(() => C.copyFile('.npmrc', path.resolve(DIST, '.npmrc')))
  );

const clonePkg: AppEff<void> = C =>
  pipe(
    C.readFile('package.json'),
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

  return TE.fromEither(
    pipe(
      E.stringifyJSON(clone, E.toError),
      E.mapLeft(e => e.message)
    )
  );
};

// --- PROGRAM
const main: AppEff<void> = pipe(
  parallel(copyNpmrc, clonePkg),
  chain(() => C => C.log(`"${DIST}" prepared for distribution`))
);

// --- RUN
run(
  main({
    ...fileSystemNode,
    ...loggerConsole
  })
);
