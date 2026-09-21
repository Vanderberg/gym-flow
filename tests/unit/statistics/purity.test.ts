import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../../../src');
const files = [
  ...fs
    .readdirSync(path.join(root, 'domain/statistics'))
    .map((f) => path.join(root, 'domain/statistics', f)),
  path.join(root, 'utils/dateMath.ts'),
];

describe('pureza de statistics', () => {
  it.each(files)('%s', (f) => {
    const src = fs.readFileSync(f, 'utf8');
    expect(src).not.toMatch(/from 'react|from 'expo|better-sqlite3|\/data\//);
    expect(src).not.toMatch(/toISOString|getTimezoneOffset|Date\.UTC/);
  });
});
