import type { SeedData, SeedExercise } from '../../../src/data/seed/types';

const ex = (name: string): SeedExercise => ({
  name,
  muscleGroup: 'Grupo',
  primaryMuscle: 'Principal',
  secondaryMuscles: 'Secundário',
  description: `Descrição de ${name}.`,
});

export function makeFixture(): SeedData {
  return {
    defaultSequenceType: 'CONTINUOUS',
    exercises: ['Ex1', 'Ex2', 'Ex3', 'Ex4', 'Ex5'].map(ex),
    programs: [
      {
        name: 'P1',
        description: null,
        homeSuggestion: null,
        isDefault: true,
        schedule: null,
        workouts: [
          {
            code: 'A',
            name: 'Treino A',
            items: [
              { exercise: 'Ex1', prescription: '3 × 10', technique: null, notes: null },
              {
                exercise: 'Ex2',
                prescription: '3 × 8',
                technique: 'BI-SET',
                notes: 'Bi-set com Ex3',
              },
              {
                exercise: 'Ex3',
                prescription: '3 × 8',
                technique: 'BI-SET',
                notes: 'Bi-set com Ex2',
              },
            ],
          },
          {
            code: 'B',
            name: 'Treino B',
            items: [{ exercise: 'Ex4', prescription: '3 × 12', technique: null, notes: null }],
          },
        ],
      },
      {
        name: 'P2',
        description: 'Segundo',
        homeSuggestion: 'Sugestão',
        isDefault: false,
        workouts: [
          {
            code: 'X',
            name: 'Treino X',
            items: [
              { exercise: 'Ex1', prescription: '2 × 10', technique: null, notes: null },
              { exercise: 'Ex5', prescription: '2 × 10', technique: null, notes: null },
            ],
          },
        ],
        schedule: [
          { weekday: 1, workout: 'X', optional: false, note: null },
          { weekday: 2, workout: null, optional: true, note: 'Opcional' },
        ],
      },
    ],
  };
}
