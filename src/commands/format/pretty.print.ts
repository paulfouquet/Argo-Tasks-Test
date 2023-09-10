import { fsa } from '@chunkd/fs';
import { command, positional, string, optional, option } from 'cmd-ts';
import { getFiles } from '../../utils/chunk.js';
import { config, registerCli, verbose } from '../common.js';
import { CliInfo } from '../../cli.info.js';
import * as prettier from "prettier"
import { logger } from '../../log.js';
import { basename } from 'path';

function isJson(x: string): boolean {
  const search = x.toLowerCase();
  return search.endsWith('.json');
}

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
    const formattedContent = await Promise.all(
      jsonFiles.map((f: string) => formatFile(f)),
    );
    // TODO: remove debug
    formattedContent.forEach((f: string) => console.log(f))
  },
});

async function formatFile(path: string, target: string = ""): Promise<string> {
  // get prettier config from linzjs/style
  const cfg = await prettier.resolveConfigFile('@linzjs/style/.prettierrc.cjs');
  if (cfg == null) {
    throw new Error('Missing Prettier config');
  }
  logger.info({ file: path }, 'Prettier:Format');
  const options = await prettier.resolveConfig(cfg);
  const formatted = await prettier.format(JSON.stringify(await fsa.readJson(path)), { ...options, parser: 'json' });
  console.log(formatted);
  if (target){
    // FIXME: can be duplicate files
    path = fsa.join(target, basename(path));
  }
  fsa.write(path, Buffer.from(formatted));
  // TODO: remove debug
  return formatted;
}
