import type { SeedProgram, SeedWorkoutExercise } from '../types';

const Rx = '3 × 10–12';
const item = (exercise: string): SeedWorkoutExercise => ({
  exercise,
  prescription: Rx,
  technique: null,
  notes: null,
});

/** Treino Padrão (docs/PRD.md §7): Dia 1–5, todos 3 × 10–12. */
export const PADRAO_PROGRAM: SeedProgram = {
  name: 'Treino Padrão',
  description: null,
  homeSuggestion: null,
  isDefault: true,
  schedule: null,
  workouts: [
    {
      code: '1',
      name: 'Peito e Tríceps',
      items: [
        'Supino',
        'Supino inclinado',
        'Fly',
        'Tríceps corda',
        'Tríceps francês',
        'Tríceps testa',
      ].map(item),
    },
    {
      code: '2',
      name: 'Costas e Bíceps',
      items: [
        'Remada curvada',
        'Remada aberta',
        'Puxada aberta',
        'Rosca Scott',
        'Rosca martelo',
        'Rosca direta',
      ].map(item),
    },
    {
      code: '3',
      name: 'Perna Completo',
      items: [
        'Agachamento Hack',
        'Cadeira extensora',
        'Adutora',
        'Mesa flexora',
        'Cadeira flexora',
        'Leg Press',
      ].map(item),
    },
    {
      code: '4',
      name: 'Ombro Isolado',
      items: ['Crucifixo inverso', 'Elevação frontal', 'Elevação lateral', 'Desenvolvimento'].map(
        item,
      ),
    },
    {
      code: '5',
      name: 'Bíceps e Tríceps',
      items: [
        'Tríceps corda',
        'Tríceps francês',
        'Tríceps testa',
        'Rosca direta',
        'Rosca martelo',
        'Rosca Scott',
      ].map(item),
    },
  ],
};
