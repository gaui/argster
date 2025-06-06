import * as path from 'path';
import { FileUtils } from '../../src/utils';

describe('FileUtils searchFilesForPatterns', () => {
  const rootDir = path.join(__dirname, '../e2e/data');
  const fileUtils = new FileUtils();

  test('it should find .env and .vol files', () => {
    const result = fileUtils.searchFilesForPatterns(
      ['**/*.env', '**/*.vol'],
      rootDir
    );

    expect(result).toEqual(
      expect.arrayContaining([
        path.join(rootDir, 'test.env'),
        path.join(rootDir, 'test.vol'),
      ])
    );
  });
});
