import { execFileSync } from 'child_process';
import { command, positional, string } from 'cmd-ts';
import { config, registerCli, verbose } from '../common.js';
import { CliInfo } from '../../cli.info.js';

export const commandPrettier = command({
  name: 'prettier',
  description: 'Format JSON files using prettier',
  version: CliInfo.version,
  args: {
    config,
    verbose,
    source: positional({ type: string, displayName: 'source', description: 'Where to format files using prettier' }),
  },

  async handler(args) {
    registerCli(this, args);
    execFileSync('npx', ['prettier', '--write', args.source]);
  },
});
