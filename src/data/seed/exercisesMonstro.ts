import type { SeedExercise } from './types';

/** Exercícios exclusivos do Treino Monstro (os 43 da ficha menos os 6 compartilhados). */
export const MONSTRO_EXERCISES: SeedExercise[] = [
  // Treino A — Ombros
  {
    name: 'Elevação lateral alternada',
    muscleGroup: 'Ombros',
    primaryMuscle: 'Deltoide lateral',
    secondaryMuscles: 'Trapézio, Deltoide anterior',
    description: 'Elevação lateral dos braços com halteres, alternando um braço de cada vez.',
  },
  {
    name: 'Elevação unilateral no cross',
    muscleGroup: 'Ombros',
    primaryMuscle: 'Deltoide lateral',
    secondaryMuscles: 'Trapézio, Supraespinhal',
    description:
      'Na polia baixa, elevar um braço de cada vez para o lado, mantendo a tensão do cabo.',
  },
  {
    name: 'Elevação unilateral no banco inclinado',
    muscleGroup: 'Ombros',
    primaryMuscle: 'Deltoide lateral',
    secondaryMuscles: 'Deltoide posterior, Trapézio',
    description: 'Apoiado de lado em um banco inclinado, elevar um halter por vez para o lado.',
  },
  {
    name: 'Elevação frontal unilateral',
    muscleGroup: 'Ombros',
    primaryMuscle: 'Deltoide anterior',
    secondaryMuscles: 'Deltoide lateral, Peitoral superior',
    description: 'Elevar um halter por vez à frente do corpo até a altura dos ombros.',
  },
  {
    name: 'Elevação frontal sentado com barra',
    muscleGroup: 'Ombros',
    primaryMuscle: 'Deltoide anterior',
    secondaryMuscles: 'Peitoral superior, Serrátil anterior',
    description:
      'Sentado, elevar a barra reta à frente do corpo, com as palmas voltadas para cima.',
  },
  {
    name: 'Desenvolvimento frontal no Smith',
    muscleGroup: 'Ombros',
    primaryMuscle: 'Deltoide anterior',
    secondaryMuscles: 'Deltoide lateral, Tríceps',
    description:
      'Empurrar a barra guiada do Smith para cima, à frente da cabeça, a partir da altura dos ombros.',
  },
  {
    name: 'Encolhimento no Smith',
    muscleGroup: 'Ombros',
    primaryMuscle: 'Trapézio superior',
    secondaryMuscles: 'Levantador da escápula, Antebraço',
    description: 'Segurando a barra do Smith, elevar os ombros em direção às orelhas e retornar.',
  },
  {
    name: 'Crucifixo invertido no cross',
    muscleGroup: 'Ombros',
    primaryMuscle: 'Deltoide posterior',
    secondaryMuscles: 'Romboides, Trapézio médio',
    description: 'Nas polias altas, com pegada cruzada, abrir os braços para trás e para os lados.',
  },
  {
    name: 'Voador invertido',
    muscleGroup: 'Ombros',
    primaryMuscle: 'Deltoide posterior',
    secondaryMuscles: 'Romboides, Trapézio médio',
    description:
      'Na máquina voador, de frente para o apoio, abrir os braços para trás trabalhando a parte posterior do ombro.',
  },
  // Treino B — Costas e bíceps
  {
    name: 'Serrote unilateral',
    muscleGroup: 'Costas',
    primaryMuscle: 'Grande dorsal',
    secondaryMuscles: 'Romboides, Bíceps, Deltoide posterior',
    description:
      'Apoiado no banco, puxar um halter por vez em direção ao quadril, com o cotovelo junto ao corpo.',
  },
  {
    name: 'Remada cavalinho pegada pronada',
    muscleGroup: 'Costas',
    primaryMuscle: 'Grande dorsal',
    secondaryMuscles: 'Trapézio, Romboides, Deltoide posterior',
    description:
      'Na remada cavalinho, puxar a barra com as palmas voltadas para baixo em direção ao tronco.',
  },
  {
    name: 'Remada cavalinho pegada neutra',
    muscleGroup: 'Costas',
    primaryMuscle: 'Grande dorsal',
    secondaryMuscles: 'Romboides, Bíceps, Braquial',
    description:
      'Na remada cavalinho, puxar a pegada com as palmas voltadas uma para a outra em direção ao tronco.',
  },
  {
    name: 'Puxada na polia alta com corda',
    muscleGroup: 'Costas',
    primaryMuscle: 'Grande dorsal',
    secondaryMuscles: 'Redondo maior, Deltoide posterior',
    description:
      'No cross, com a corda na polia alta, puxar os braços para baixo e para trás, sentado em um step.',
  },
  {
    name: 'Remada articulada',
    muscleGroup: 'Costas',
    primaryMuscle: 'Trapézio médio',
    secondaryMuscles: 'Grande dorsal, Romboides, Bíceps',
    description:
      'Na máquina de remada articulada, puxar as alças em direção ao tronco aproximando as escápulas.',
  },
  {
    name: 'Remada baixa unilateral',
    muscleGroup: 'Costas',
    primaryMuscle: 'Grande dorsal',
    secondaryMuscles: 'Romboides, Bíceps, Antebraço',
    description:
      'Na polia baixa, puxar a alça com um braço de cada vez, girando o punho durante o movimento.',
  },
  {
    name: 'Puxada alta pegada pronada',
    muscleGroup: 'Costas',
    primaryMuscle: 'Grande dorsal',
    secondaryMuscles: 'Redondo maior, Bíceps',
    description: 'Na polia alta, puxar a barra até o peito com as palmas voltadas para a frente.',
  },
  {
    name: 'Puxada alta pegada supinada',
    muscleGroup: 'Costas',
    primaryMuscle: 'Grande dorsal',
    secondaryMuscles: 'Bíceps, Redondo maior',
    description: 'Na polia alta, puxar a barra até o peito com as palmas voltadas para o rosto.',
  },
  {
    name: 'Puxada alta fechada na barra V',
    muscleGroup: 'Costas',
    primaryMuscle: 'Grande dorsal',
    secondaryMuscles: 'Bíceps, Braquial, Romboides',
    description:
      'Na polia alta com barra V, puxar a pegada fechada em direção ao peito, inclinando levemente o tronco para trás.',
  },
  {
    name: 'Rosca martelo sentado',
    muscleGroup: 'Braços',
    primaryMuscle: 'Braquial',
    secondaryMuscles: 'Bíceps, Braquiorradial',
    description:
      'Sentado, flexionar os cotovelos com halteres em pegada neutra, um braço de cada vez.',
  },
  // Treino C — Pernas
  {
    name: 'Avanço unilateral',
    muscleGroup: 'Pernas',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: 'Glúteos, Posteriores da coxa',
    description:
      'Dar um passo à frente e flexionar os joelhos até quase tocar o chão, trabalhando uma perna de cada vez.',
  },
  {
    name: 'Passada unilateral',
    muscleGroup: 'Pernas',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: 'Glúteos, Posteriores da coxa, Panturrilha',
    description: 'Caminhada em passadas largas, alternando as pernas, contada em passos.',
  },
  {
    name: 'Agachamento livre ou no Smith',
    muscleGroup: 'Pernas',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: 'Glúteos, Posteriores da coxa, Lombar',
    description:
      'Flexionar joelhos e quadris descendo o corpo com a barra apoiada nas costas, livre ou guiada no Smith.',
  },
  {
    name: 'Leg press 45°',
    muscleGroup: 'Pernas',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: 'Glúteos, Posteriores da coxa',
    description: 'Empurrar a plataforma inclinada a 45° com os pés, estendendo joelhos e quadris.',
  },
  {
    name: 'Afundo unilateral',
    muscleGroup: 'Pernas',
    primaryMuscle: 'Quadríceps',
    secondaryMuscles: 'Glúteos, Adutores da coxa',
    description:
      'Com um pé à frente e o outro atrás, flexionar os joelhos descendo o corpo, livre ou com halteres.',
  },
  {
    name: 'Panturrilha sentado',
    muscleGroup: 'Pernas',
    primaryMuscle: 'Sóleo',
    secondaryMuscles: 'Gastrocnêmio',
    description: 'Sentado, com os joelhos flexionados, elevar os calcanhares contra a resistência.',
  },
  {
    name: 'Panturrilha em pé',
    muscleGroup: 'Pernas',
    primaryMuscle: 'Gastrocnêmio',
    secondaryMuscles: 'Sóleo',
    description:
      'Em pé, com as pernas estendidas, elevar os calcanhares e retornar controlando a descida.',
  },
  // Treino D — Peito e tríceps
  {
    name: 'Apoio no chão',
    muscleGroup: 'Peito',
    primaryMuscle: 'Peitoral maior',
    secondaryMuscles: 'Deltoide anterior, Tríceps, Abdômen',
    description:
      'Com as mãos e os pés no chão, flexionar os cotovelos descendo o corpo e empurrar de volta.',
  },
  {
    name: 'Crucifixo com halter pegada pronada',
    muscleGroup: 'Peito',
    primaryMuscle: 'Peitoral maior',
    secondaryMuscles: 'Deltoide anterior',
    description:
      'Deitado, abrir e fechar os braços em arco com halteres, com as palmas voltadas para baixo.',
  },
  {
    name: 'Crucifixo com halter pegada neutra',
    muscleGroup: 'Peito',
    primaryMuscle: 'Peitoral maior',
    secondaryMuscles: 'Deltoide anterior, Bíceps',
    description:
      'Deitado, abrir e fechar os braços em arco com halteres, com as palmas voltadas uma para a outra.',
  },
  {
    name: 'Supino reto',
    muscleGroup: 'Peito',
    primaryMuscle: 'Peitoral maior',
    secondaryMuscles: 'Deltoide anterior, Tríceps',
    description: 'Deitado no banco reto, empurrar a barra para cima a partir da altura do peito.',
  },
  {
    name: 'Crucifixo reto no cross',
    muscleGroup: 'Peito',
    primaryMuscle: 'Peitoral maior',
    secondaryMuscles: 'Deltoide anterior',
    description:
      'Deitado entre as polias, aproximar as mãos sobre o peito em arco, mantendo a tensão dos cabos.',
  },
  {
    name: 'Crucifixo inclinado com halter',
    muscleGroup: 'Peito',
    primaryMuscle: 'Peitoral superior',
    secondaryMuscles: 'Deltoide anterior',
    description: 'Em um banco inclinado, abrir e fechar os braços em arco com halteres.',
  },
  {
    name: 'Voador',
    muscleGroup: 'Peito',
    primaryMuscle: 'Peitoral maior',
    secondaryMuscles: 'Deltoide anterior',
    description: 'Na máquina voador, aproximar os braços à frente do peito contra a resistência.',
  },
  {
    name: 'Tríceps testa unilateral no cross',
    muscleGroup: 'Braços',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: 'Antebraço',
    description:
      'Na polia alta, flexionar e estender o cotovelo levando a alça em direção à testa, um braço de cada vez.',
  },
  {
    name: 'Tríceps no cross com barra W',
    muscleGroup: 'Braços',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: 'Ancôneo, Antebraço',
    description:
      'Na polia alta com barra W, estender os cotovelos empurrando a barra para baixo, com pegada normal.',
  },
  {
    name: 'Tríceps no cross com barra reta invertida',
    muscleGroup: 'Braços',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: 'Ancôneo, Antebraço',
    description:
      'Na polia alta com barra reta, estender os cotovelos empurrando a barra para baixo, com pegada invertida.',
  },
  {
    name: 'Tríceps coice',
    muscleGroup: 'Braços',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: 'Deltoide posterior',
    description:
      'Com o tronco inclinado e o cotovelo junto ao corpo, estender o antebraço para trás segurando um halter.',
  },
];
