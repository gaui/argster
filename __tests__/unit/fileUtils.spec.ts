import path from 'path';
import { vi } from 'vitest';
import mockFs from 'mock-fs';
import { FileUtils } from '../../src/utils';

describe('searchFilesForPatterns', () => {
  test('it should find files for multiple patterns', () => {
    const utils = new FileUtils();
    const rootDir = path.join(import.meta.dirname, '../e2e/data');
    const patterns = ['**/*.env', '**/*.vol'];
    const files = utils.searchFilesForPatterns(patterns, rootDir);

    const expected = [
      path.join(rootDir, 'test.env'),
      path.join(rootDir, 'test.vol')
    ];

    expect(files).toEqual(expect.arrayContaining(expected));
    expect(files.length).toBe(expected.length);
  });

  test('it should find .env and .vol files', () => {
    const utils = new FileUtils();
    const rootDir = path.join(import.meta.dirname, '../e2e/data');

    const envFiles = utils.searchFilesForPatterns(['**/*.env'], rootDir);
    const volFiles = utils.searchFilesForPatterns(['**/*.vol'], rootDir);

    expect(envFiles).toEqual([path.join(rootDir, 'test.env')]);
    expect(volFiles).toEqual([path.join(rootDir, 'test.vol')]);
  });

  test('it should return unique results for overlapping patterns', () => {
    const utils = new FileUtils();
    const rootDir = path.join(import.meta.dirname, '../e2e/data');

    const patterns = ['**/*.*', '**/*.env'];
    const files = utils.searchFilesForPatterns(patterns, rootDir);

    const expected = [
      path.join(rootDir, 'test.vol'),
      path.join(rootDir, 'test.lbl'),
      path.join(rootDir, 'test.env')
    ];

    expect(files).toEqual(expected);
  });
});

describe('computeFileContents', () => {
  test('it handles empty patterns', () => {
    const utils = new FileUtils();
    const patterns: IArgumentFilePatterns[] = [{ prefix: '--env', patterns: [] }];

    const results = utils.computeFileContents(patterns);

    expect(results[0].contents).toEqual([]);
  });
});

describe('FileUtils.computeFiles', () => {
  afterEach(() => {
    mockFs.restore();
  });

  test('replaces patterns with absolute paths and removes duplicates', () => {
    mockFs(
      {
        '/tmp': {
          'a.env': '',
          'b.env': ''
        }
      },
      { createTmp: false }
    );

    const utils = new FileUtils();

    const patterns: IArgumentFilePatterns[] = [
      { prefix: '--f', patterns: ['*.env', 'a.env'] }
    ];

    const results = utils.computeFiles(patterns, '/tmp');
    const files = results[0].patterns;

    expect(files).toEqual(expect.arrayContaining(['/tmp/a.env', '/tmp/b.env']));
    expect(files.length).toBe(2);
    expect(files.every(p => path.isAbsolute(p))).toBe(true);
  });
});

describe('FileUtils.readFileAsArray', () => {
  afterEach(() => {
    mockFs.restore();
  });

  test('returns trimmed non-empty lines', () => {
    mockFs({ '/tmp/sample.txt': 'foo\nbar\n\n  baz  \n' }, { createTmp: false });

    const utils = new FileUtils();

    const arr = utils.readFileAsArray('/tmp/sample.txt');

    expect(arr).toEqual(['foo', 'bar', 'baz']);
  });
});
