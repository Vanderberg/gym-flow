import type { SeedExercise } from './types';

/** Exercícios exclusivos do Treino Padrão. */
export const PADRAO_EXERCISES: SeedExercise[] = [
  {
    name: 'Supino',
    muscleGroup: 'Peito',
    primaryMuscle: 'Peitoral maior',
    secondaryMuscles: 'Deltoide anterior, Tríceps',
    description: 'Deitado no banco, empurrar a carga para cima a partir da altura do peito.',
  },
  {
    name: 'Fly',
    muscleGroup: 'Peito',
    primaryMuscle: 'Peitoral maior',
    secondaryMuscles: 'Deltoide anterior',
    description:
      'Movimento de abrir e fechar os braços em arco, na máquina ou com halteres, alongando o peitoral.',
  },
  {
    name: 'Tríceps corda',
    muscleGroup: 'Braços',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: 'Ancôneo',
    description: 'Na polia alta com corda, estender os cotovelos empurrando a corda para baixo.',
  },
  {
    name: 'Tríceps francês',
    muscleGroup: 'Braços',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: 'Deltoide anterior',
    description:
      'Com a carga acima ou atrás da cabeça, flexionar e estender os cotovelos mantendo os braços parados.',
  },
  {
    name: 'Tríceps testa',
    muscleGroup: 'Braços',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: 'Antebraço',
    description:
      'Deitado, flexionar os cotovelos levando a barra em direção à testa e estendê-los de volta.',
  },
  {
    name: 'Remada curvada',
    muscleGroup: 'Costas',
    primaryMuscle: 'Grande dorsal',
    secondaryMuscles: 'Trapézio, Romboides, Bíceps',
    description: 'Com o tronco inclinado à frente, puxar a barra em direção ao abdômen.',
  },
  {
    name: 'Remada aberta',
    muscleGroup: 'Costas',
    primaryMuscle: 'Trapézio médio',
    secondaryMuscles: 'Romboides, Deltoide posterior, Bíceps',
    description:
      'Remada com pegada larga, levando os cotovelos para os lados e aproximando as escápulas.',
  },
  {
    name: 'Puxada aberta',
    muscleGroup: 'Costas',
    primaryMuscle: 'Grande dorsal',
    secondaryMuscles: 'Redondo maior, Bíceps',
    description: 'Na polia alta, puxar a barra com pegada larga até a altura do peito.',
  },
  {
    name: 'Rosca Scott',
    muscleGroup: 'Braços',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: 'Braquial, Antebraço',
    description:
      'Com os braços apoiados no banco Scott, flexionar os cotovelos levando a barra em direção aos ombros.',
  },
  {
    name: 'Rosca martelo',
    muscleGroup: 'Braços',
    primaryMuscle: 'Braquial',
    secondaryMuscles: 'Bíceps, Braquiorradial',
    description:
      'Flexão dos cotovelos com halteres em pegada neutra, com as palmas voltadas uma para a outra.',
  },
  {
    name: 'Rosca direta',
    muscleGroup: 'Braços',
    primaryMuscle: 'Bíceps',
    secondaryMuscles: 'Braquial, Antebraço',
    description:
      'Em pé, flexionar os cotovelos levando a barra à frente do corpo até a altura dos ombros.',
  },
  {
    name: 'Agachamento Hack',
    muscleGroup: 'Pernas',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: 'Glúteos, Posteriores da coxa',
    description:
      'Agachamento na máquina hack, com as costas apoiadas e os pés na plataforma inclinada.',
  },
  {
    name: 'Cadeira flexora',
    muscleGroup: 'Pernas',
    primaryMuscle: 'Posteriores da coxa',
    secondaryMuscles: 'Panturrilha',
    description: 'Sentado na máquina, flexionar os joelhos puxando o apoio para baixo e para trás.',
  },
  {
    name: 'Leg Press',
    muscleGroup: 'Pernas',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: 'Glúteos, Posteriores da coxa',
    description:
      'Empurrar a plataforma com os pés, estendendo joelhos e quadris, com as costas apoiadas.',
  },
  {
    name: 'Crucifixo inverso',
    muscleGroup: 'Ombros',
    primaryMuscle: 'Deltoide posterior',
    secondaryMuscles: 'Romboides, Trapézio',
    description:
      'Abrir os braços para trás e para os lados, com o tronco inclinado ou na máquina, trabalhando a parte posterior do ombro.',
  },
  {
    name: 'Desenvolvimento',
    muscleGroup: 'Ombros',
    primaryMuscle: 'Deltoide anterior',
    secondaryMuscles: 'Deltoide lateral, Tríceps',
    description: 'Empurrar a carga para cima, acima da cabeça, a partir da altura dos ombros.',
  },
];
