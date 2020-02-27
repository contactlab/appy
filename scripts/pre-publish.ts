import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import {Program, run} from './helpers/program';

interface AppEff<A> extends Program<{}, A> {}

const main: AppEff<void> = RTE.left(
  '"npm publish" can not be directly run; please use "npm run release"'
);

run(main({}));
