import { fsa } from '@chunkd/fs';
import { command, option, optional, restPositionals, string } from 'cmd-ts';

import { CliInfo } from '../../cli.info.js';
import { logger } from '../../log.js';
import { getFiles } from '../../utils/chunk.js';
import { isJson } from '../../utils/file.type.js';
import { config, registerCli, verbose } from '../common.js';
import { prettyPrint } from '../format/pretty.print.js';

export const commandMergeJson = command({
  name: 'merge-json',
  description: 'Merge JSON files',
  version: CliInfo.version,
  args: {
    config,
    verbose,
    include: option({ type: optional(string), long: 'include', description: 'Include files eg "non-visual-qa.*"' }),
    output: option({ type: string, long: 'output', description: 'Output location for the merged file' }),
    location: restPositionals({
      type: string,
      displayName: 'location',
      description: 'Location of the JSON files to merge',
    }),
  },

  async handler(args) {
    registerCli(this, args);
    const startTime = performance.now();
    logger.info('MergeJson:Start');
    const files = await getFiles(args.location, args);
    const jsonFiles = files.flat().filter(isJson);
    if (jsonFiles.length === 0) {
      logger.info('MergeJson:NoFileFound');
      return;
    }
    // test if can access one of the file
    if (jsonFiles[0]) await fsa.head(jsonFiles[0]);

    const merged = await mergeJson(jsonFiles);
    fsa.write(args.output, await prettyPrint(JSON.stringify(merged)));

    logger.info(
      { fileCount: jsonFiles.length, duration: performance.now() - startTime, path: args.output },
      'MergeJson:Done',
    );
  },
});

/**
 * Merge a list of JSON files content into a JSON array
 *
 * @param jsonFiles list of path of JSON files to merge
 * @returns a JSON array
 */
export async function mergeJson(jsonFiles: string[]): Promise<JSON[]> {
  return await Promise.all(jsonFiles.map((f: string) => fsa.readJson(f) as Promise<JSON>));
}
