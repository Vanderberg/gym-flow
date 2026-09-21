import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../../../src');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf-8');

describe('pureza do cronômetro', () => {
  const domain = fs
    .readdirSync(path.join(root, 'domain/restTimer'))
    .filter((f) => f.endsWith('.ts'))
    .map((f) => [f, read(`domain/restTimer/${f}`)] as const);

  it.each(domain)('domínio %s não depende de plataforma nem relógio', (_f, src) => {
    expect(src).not.toMatch(/from ['"](react|react-native|expo-[^'"]*|better-sqlite3)['"]/);
    expect(src).not.toMatch(/data\//);
    expect(src).not.toMatch(/Date\.now|new Date\(|performance\.now/);
  });

  it.each(['store/restTimerStore.ts', 'hooks/useRestTimer.ts'])(
    '%s não toca dados de sessão',
    (file) => {
      const src = read(file);
      expect(src).not.toMatch(/SetExerciseCompleted|SetExerciseWeight|FinishWorkout|StartWorkout/);
      expect(src).not.toMatch(/repositor|@\/data|\.\.\/data/i);
    },
  );
});
