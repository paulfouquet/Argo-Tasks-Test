import assert from 'node:assert';
import { before, describe, it } from 'node:test';

import { fsa } from '@chunkd/fs';
import { FsMemory } from '@chunkd/source-memory';
import path from 'path';

import { commandMergeJson, mergeJson } from '../merge.json.js';

describe('mergeJson', () => {
  const memoryFs = new FsMemory();
  const dir = '/tmp/json';
  const testA = { test: { test: 'testA' } };
  const testB = { test: { test: 'testB' } };
  const fileA = path.join(dir, 'non_visual_qa-a.json');
  const fileB = path.join(dir, 'non_visual_qa-b.json');

  before(() => {
    fsa.register(dir, memoryFs);
  });
  it('should merge json files to JSON array', async () => {
    await fsa.write(fileA, Buffer.from(JSON.stringify(testA)));
    await fsa.write(fileB, Buffer.from(JSON.stringify(testB)));

    assert.deepEqual(await mergeJson([fileA, fileB]), [testA, testB]);
  });
  it('should merge json into output file', async () => {
    await fsa.write(fileA, Buffer.from(JSON.stringify(testA)));
    await fsa.write(fileB, Buffer.from(JSON.stringify(testB)));
    const outputFile = path.join(dir, 'non_visual_qa.json');
    const args = {
      config: undefined,
      verbose: false,
    };
    await commandMergeJson.handler({
      include: 'non_visual_qa',
      output: outputFile,
      location: [dir],
      ...args,
    });
    assert.deepEqual(await fsa.readJson(outputFile), [testA, testB]);
  });
});
