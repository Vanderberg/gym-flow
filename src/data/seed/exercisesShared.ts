import type { SeedExercise } from './types';

/** Exercícios usados pelos dois programas (mesmo nome normalizado = mesma entidade). */
export const SHARED_EXERCISES: SeedExercise[] = [
  {
    name: 'Elevação frontal',
    muscleGroup: 'Ombros',
    primaryMuscle: 'Deltoide anterior',
    secondaryMuscles: 'Deltoide lateral, Peitoral superior',
    description:
      'Elevação dos braços à frente do corpo até a altura dos ombros, com halteres ou barra.',
  },
  {
    name: 'Elevação lateral',
    muscleGroup: 'Ombros',
    primaryMuscle: 'Deltoide lateral',
    secondaryMuscles: 'Trapézio, Deltoide anterior',
    description:
      'Elevação dos braços para os lados do corpo até a altura dos ombros, com halteres.',
  },
  {
    name: 'Supino inclinado',
    muscleGroup: 'Peito',
    primaryMuscle: 'Peitoral superior',
    secondaryMuscles: 'Deltoide anterior, Tríceps',
    description:
      'Empurrar a carga para cima em um banco inclinado, enfatizando a parte alta do peitoral.',
  },
  {
    name: 'Adutora',
    muscleGroup: 'Pernas',
    primaryMuscle: 'Adutores da coxa',
    secondaryMuscles: 'Pectíneo, Grácil',
    description:
      'Na máquina, aproximar as pernas uma da outra, trabalhando a parte interna das coxas.',
  },
  {
    name: 'Cadeira extensora',
    muscleGroup: 'Pernas',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: 'Nenhum relevante',
    description:
      'Sentado na máquina, estender os joelhos contra a resistência, isolando a frente da coxa.',
  },
  {
    name: 'Mesa flexora',
    muscleGroup: 'Pernas',
    primaryMuscle: 'Posteriores da coxa',
    secondaryMuscles: 'Panturrilha, Glúteos',
    description:
      'Deitado de bruços na máquina, flexionar os joelhos levando os calcanhares em direção aos glúteos.',
  },
];
