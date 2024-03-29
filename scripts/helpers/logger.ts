import {info, log} from 'fp-ts/Console';
import {rightIO} from 'fp-ts/TaskEither';
import {Eff} from './program';

export interface Logger {
  readonly info: (s: string) => Eff<void>;
  readonly log: (s: string) => Eff<void>;
}

export const loggerConsole: Logger = {
  info: s => rightIO(info(`> ${s}`)),
  log: s => rightIO(log(`> ${s}`))
};
