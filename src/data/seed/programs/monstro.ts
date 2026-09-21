import type { Technique } from '../../../constants/techniques';
import type { SeedProgram, SeedWorkoutExercise } from '../types';

const item = (
  exercise: string,
  prescription: string,
  technique: Technique | null,
  notes: string | null,
): SeedWorkoutExercise => ({ exercise, prescription, technique, notes });

const OPTIONAL_NOTE = 'Abdominais supra/infra e oblíquos';

/** Treino Monstro: transcrição literal de docs/fichas-treino.md (seção 1). */
export const MONSTRO_PROGRAM: SeedProgram = {
  name: 'Treino Monstro',
  description: null,
  homeSuggestion:
    'Caminhada ligeira, sem correr: 30 min de manhã e 30 min à noite, ou 1 h, longe do treino resistido.',
  isDefault: false,
  workouts: [
    {
      code: 'A',
      name: 'Ombros completos',
      items: [
        item(
          'Elevação lateral alternada',
          '3 × 8',
          'BI-SET',
          'Bi-set com elevação frontal. Halteres, peso leve para aquecer',
        ),
        item(
          'Elevação frontal',
          '3 × 8',
          'BI-SET',
          'Bi-set com elevação lateral alternada. Halteres, peso leve',
        ),
        item('Elevação unilateral no cross', '3 × 10/10', null, 'Cada braço, sem descanso'),
        item(
          'Elevação unilateral no banco inclinado',
          '3 × 10/10',
          null,
          'Com halter, cada braço, sem descanso',
        ),
        item('Elevação lateral', '3 × 6/8/10', 'DROP-SET', 'Pirâmide decrescente (descer carga)'),
        item('Elevação frontal unilateral', '3 × 8/8', null, 'Com halter'),
        item(
          'Elevação frontal sentado com barra',
          '2 × 10',
          null,
          'Barra reta em supinação, segurar excêntrica',
        ),
        item('Desenvolvimento frontal no Smith', '3 × 10', null, 'Concêntrica lenta'),
        item('Encolhimento no Smith', '3 × 20', null, 'Trapézio'),
        item('Crucifixo invertido no cross', '3 × 10', null, 'Pegada cruzada'),
        item('Voador invertido', '3 × 12', null, 'Na máquina'),
      ],
    },
    {
      code: 'B',
      name: 'Costas e bíceps',
      items: [
        item('Serrote unilateral', '3 × 10/10', null, 'Cada braço, sem descanso'),
        item(
          'Remada cavalinho pegada pronada',
          '3 × 8',
          'BI-SET',
          'Bi-set com remada cavalinho pegada neutra',
        ),
        item(
          'Remada cavalinho pegada neutra',
          '3 × 8',
          'BI-SET',
          'Bi-set com remada cavalinho pegada pronada',
        ),
        item(
          'Puxada na polia alta com corda',
          '3 × 16',
          null,
          'No cross, corda de tríceps, sentado no step',
        ),
        item('Remada articulada', '3 × 10', null, 'Excêntrica lenta (volta)'),
        item(
          'Remada baixa unilateral',
          '3 × 10',
          null,
          'Com rotação de punho, cada braço, sem descanso',
        ),
        item(
          'Puxada alta pegada pronada',
          '3 × 8',
          'BI-SET',
          'Bi-set com puxada alta pegada supinada',
        ),
        item(
          'Puxada alta pegada supinada',
          '3 × 8',
          'BI-SET',
          'Bi-set com puxada alta pegada pronada',
        ),
        item('Puxada alta fechada na barra V', '3 × 12', null, 'Jogar o tronco para trás'),
        item('Rosca martelo sentado', '3 × 10', null, 'Com halter, cada braço'),
      ],
    },
    {
      code: 'C',
      name: 'Pernas completas',
      items: [
        item('Avanço unilateral', '3 × 8/8', null, 'Cada perna'),
        item('Passada unilateral', '3 × 20/30/40 passos', null, null),
        item('Agachamento livre ou no Smith', '3 × 12/10/8', 'PROGRESSÃO DE CARGA', null),
        item(
          'Leg press 45°',
          '3 × 10/20',
          null,
          'Pés normais (completo) combinado com pés juntos (movimento curto)',
        ),
        item('Cadeira extensora', '3 × 10/10/10', 'DROP-SET', 'Pirâmide crescente'),
        item('Afundo unilateral', '3 × 10/10', null, 'Livre, com halter'),
        item('Mesa flexora', '3 × 8/8/8', 'DROP-SET', 'Pirâmide decrescente'),
        item('Adutora', '3 × 20', null, 'Movimento rápido'),
        item('Panturrilha sentado', '3 × 15', 'BI-SET', 'Bi-set com panturrilha em pé'),
        item('Panturrilha em pé', '3 × 15', 'BI-SET', 'Bi-set com panturrilha sentado'),
      ],
    },
    {
      code: 'D',
      name: 'Peito e tríceps',
      items: [
        item('Apoio no chão', '3 × 10/15/20', null, null),
        item(
          'Crucifixo com halter pegada pronada',
          '3 × 8',
          'BI-SET',
          'Bi-set com crucifixo com halter pegada neutra',
        ),
        item(
          'Crucifixo com halter pegada neutra',
          '3 × 8',
          'BI-SET',
          'Bi-set com crucifixo com halter pegada pronada',
        ),
        item('Supino reto', '4 × 8', 'PROGRESSÃO DE CARGA', 'Aumentar a carga a cada série'),
        item('Crucifixo reto no cross', '3 × 12', null, 'Segurar excêntrica (volta)'),
        item(
          'Supino inclinado',
          '3 × 8',
          null,
          'Ponto 0 na fase baixa do movimento (contar 5 s para subir e descer)',
        ),
        item('Crucifixo inclinado com halter', '3 × 8', null, 'Subida lenta, descida normal'),
        item('Voador', '3 × até a falha', 'FALHA', 'Na máquina'),
        item(
          'Tríceps testa unilateral no cross',
          '3 × 10',
          null,
          'Polia alta, cada braço, sem parar',
        ),
        item(
          'Tríceps no cross com barra W',
          '3 × 10',
          'BI-SET',
          'Pegada normal. Bi-set com barra reta pegada invertida',
        ),
        item(
          'Tríceps no cross com barra reta invertida',
          '3 × 10',
          'BI-SET',
          'Pegada invertida. Bi-set com barra W pegada normal',
        ),
        item('Tríceps coice', '3 × 10/10', null, 'Com halter, cada braço, sem parar'),
      ],
    },
  ],
  schedule: [
    { weekday: 1, workout: 'A', optional: false, note: null },
    { weekday: 2, workout: 'B', optional: false, note: null },
    { weekday: 3, workout: null, optional: false, note: null },
    { weekday: 4, workout: 'C', optional: false, note: null },
    { weekday: 5, workout: 'D', optional: false, note: null },
    { weekday: 6, workout: null, optional: true, note: OPTIONAL_NOTE },
    { weekday: 7, workout: null, optional: true, note: OPTIONAL_NOTE },
  ],
};
