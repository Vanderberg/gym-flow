import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../../../src');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf-8');

const domainFiles = fs
  .readdirSync(path.join(root, 'domain/help'))
  .filter((f) => f.endsWith('.ts'))
  .map((f) => `domain/help/${f}`);
const stateFiles = ['store/helpStore.ts', 'hooks/useHelp.ts'];

describe('pureza da ajuda contextual (BL-110..116)', () => {
  it.each(domainFiles)('domínio %s não importa react nem plataforma', (file) => {
    const src = read(file);
    expect(src).not.toMatch(/from ['"](react|react-native)['"]/);
  });

  it.each([...domainFiles, ...stateFiles])(
    '%s não importa expo, sqlite, data ou cronômetro',
    (file) => {
      const src = read(file);
      expect(src).not.toMatch(/from ['"](expo-[^'"]*|better-sqlite3)['"]/);
      expect(src).not.toMatch(/from ['"][^'"]*(@\/data|\/data\/)[^'"]*['"]/);
      expect(src).not.toMatch(/from ['"][^'"]*(timer|cronometro)[^'"]*['"]/i);
    },
  );

  it('a legenda não referencia prescrição nem observações', () => {
    expect(read('domain/help/legend.ts')).not.toMatch(/prescription|notes/);
  });
});
