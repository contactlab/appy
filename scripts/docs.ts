import {sequenceT} from 'fp-ts/Apply';
import * as RTE from 'fp-ts/ReaderTaskEither';
import * as TE from 'fp-ts/TaskEither';
import {pipe} from 'fp-ts/function';
import {FileSystem, fileSystemNode} from './helpers/fs';
import {Logger, loggerConsole} from './helpers/logger';
import {Program, run} from './helpers/program';

const sequenceRTE = sequenceT(RTE.ApplicativePar);

interface Capabilities extends FileSystem, Logger {}

interface AppEff<A> extends Program<Capabilities, A> {}

const makeHeadline = (title: string, order: number): string => `---
title: ${title}
nav_order: ${order}
---

`;

const copyInDocs = (
  source: string,
  dest: string,
  headline: string
): AppEff<void> => C =>
  pipe(
    C.info(`Copy content of ${source} into ${dest}...`),
    TE.chain(() => C.readFile(source)),
    TE.map(content => `${headline}${content}`),
    TE.chain(content => C.writeFile(dest, content)),
    TE.chainFirst(() => C.log(`${dest} updated`))
  );

const main = sequenceRTE(
  copyInDocs('README.md', 'docs/index.md', makeHeadline('Home', 1)),
  copyInDocs('CHANGELOG.md', 'docs/changelog.md', makeHeadline('CHANGELOG', 2))
);

// --- Run the program
run(
  main({
    ...fileSystemNode,
    ...loggerConsole
  })
);
