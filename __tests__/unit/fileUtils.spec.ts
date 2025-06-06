import path from 'path';
import { FileUtils } from '../../src/utils';

describe('searchFilesForPatterns', () => {
  test('it should find files for multiple patterns', () => {
    const utils = new FileUtils();
    const rootDir = path.relative(process.cwd(), path.join(__dirname, '../e2e/data'));
    const patterns = ['**/*.env', '**/*.vol'];
    const files = utils.searchFilesForPatterns(patterns, rootDir);

    const expected = [
      path.join(rootDir, 'test.env'),
      path.join(rootDir, 'test.vol')
    ];

    expect(files).toEqual(expect.arrayContaining(expected));
    expect(files.length).toBe(expected.length);
  });
});
