import fs from 'fs';
import path from 'path';

function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? files(p) : p.endsWith('.ts') ? [p] : [];
  });
}

describe('pureza do domínio de sequência', () => {
  const dir = path.join(__dirname, '../../../../src/domain/sequence');
  it.each(files(dir))('%s', (f) => {
    const src = fs.readFileSync(f, 'utf8');
    expect(src).not.toMatch(/from ['"](react|expo-[^'"]*|better-sqlite3)['"]/);
    expect(src).not.toMatch(/from ['"][./]*\/data\//);
    expect(src).not.toMatch(/Padrão|Monstro/);
  });
});
