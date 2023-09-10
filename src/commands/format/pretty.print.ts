import { fsa } from '@chunkd/fs';
import { command, positional, string, optional, option } from 'cmd-ts';
import { getFiles } from '../../utils/chunk.js';
import { config, registerCli, verbose } from '../common.js';
import { CliInfo } from '../../cli.info.js';
import * as prettier from 'prettier';
import { logger } from '../../log.js';
import { basename } from 'path';

function isJson(x: string): boolean {
  const search = x.toLowerCase();
  return search.endsWith('.json');
}

export const defaultPrettierFormat: prettier.Options = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  useTabs: false,
  tabWidth: 2,
};

export const commandPrettier = command({
  name: 'prettier',
  description: 'Format JSON files using Prettier',
  version: CliInfo.version,
  args: {
    config,
    verbose,
    target: option({
      type: optional(string),
      long: 'target',
      description: 'Use if files have to be saved somewhere else instead of overwrite the source.',
    }),
    path: positional({ type: string, displayName: 'path', description: 'Path of the files to format with Prettier' }),
  },

  async handler(args) {
    registerCli(this, args);
    const files = await getFiles([args.path]);
    // This should be already filtered by `list` returning only json files
    const jsonFiles = files.flat().filter(isJson);
    if (jsonFiles.length === 0) throw new Error('No Files found');
    // test if can access on of the file
    if (jsonFiles[0]) await fsa.head(jsonFiles[0]);
    await Promise.all(jsonFiles.map((f: string) => formatFile(f, args.target)));
  },
});

async function formatFile(path: string, target = ''): Promise<void> {
  logger.info({ file: path }, 'Prettier:Format');
  const formatted = await prettier.format(JSON.stringify(await fsa.readJson(path)), {
    ...defaultPrettierFormat,
    parser: 'json',
  });
  if (target) {
    // FIXME: can be duplicate files
    path = fsa.join(target, basename(path));
  }
  fsa.write(path, Buffer.from(formatted));
}
