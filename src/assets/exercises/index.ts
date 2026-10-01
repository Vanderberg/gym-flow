import type { ImageSourcePropType } from 'react-native';

/**
 * Registro estático de imagens de exercício (spec 013).
 *
 * O bundler (Metro) exige `require()` com string literal — não é possível montar o caminho a
 * partir de uma variável. Por isso toda imagem precisa de uma entrada explícita aqui.
 *
 * Chave: `normalizeName(exercise.name)` (src/utils/normalizeName.ts) — a mesma normalização
 * usada para gerar `exercise.name_key` no banco (trim, espaços únicos, NFC, minúsculas pt-BR).
 *
 * Cobertura é parcial por natureza: nem todo exercício tem uma foto distinta disponível (ex.:
 * o lado espelhado de um bi-set às vezes só tem imagem de um dos dois). Nesses casos a chave
 * fica de fora do mapa e `ExerciseImage` mostra o placeholder genérico — ver FR-003 da spec.
 *
 * Para adicionar uma imagem nova: copie o arquivo para esta pasta e acrescente uma linha abaixo.
 */
export const EXERCISE_IMAGES: Record<string, ImageSourcePropType> = {
  // Treino Monstro — A (Ombros completos)
  'elevação lateral alternada': require('./elevacao-lateral-alternada.jpg'),
  'elevação frontal': require('./elevacao-frontal.png'),
  'elevação unilateral no cross': require('./elevacao-unilateral-no-cross.jpg'),
  'elevação unilateral no banco inclinado': require('./elevacao-unilateral-banco-inclinado.jpg'),
  'elevação lateral': require('./elevacao-lateral.png'),
  'elevação frontal unilateral': require('./elevacao-frontal-unilateral.jpg'),
  'elevação frontal sentado com barra': require('./elevacao-frontal-sentado-com-barra.jpg'),
  'desenvolvimento frontal no smith': require('./desenvolvimento-frontal-no-smith.jpg'),
  'encolhimento no smith': require('./encolhimento-no-smith.jpg'),
  'crucifixo invertido no cross': require('./crucifixo-invertido-no-cross.jpg'),
  'voador invertido': require('./voador-invertido.jpg'),

  // Treino Monstro — B (Costas e bíceps)
  'serrote unilateral': require('./serrote-unilateral.jpg'),
  'remada cavalinho pegada pronada': require('./remada-cavalinho-pegada-pronada.jpg'),
  // 'remada cavalinho pegada neutra': sem foto própria (par do bi-set acima) — placeholder.
  'puxada na polia alta com corda': require('./puxada-na-polia-alta-com-corda.jpg'),
  'remada articulada': require('./remada-articulada.jpg'),
  'remada baixa unilateral': require('./remada-baixa-unilateral.jpg'),
  'puxada alta pegada pronada': require('./puxada-alta-pegada-pronada.jpg'),
  // 'puxada alta pegada supinada': sem foto própria (par do bi-set acima) — placeholder.
  'puxada alta fechada na barra v': require('./puxada-alta-fechada-na-barra-v.jpg'),
  'rosca martelo sentado': require('./rosca-martelo-sentado.jpg'),

  // Treino Monstro — C (Pernas completas)
  'avanço unilateral': require('./avanco-unilateral.jpg'),
  'passada unilateral': require('./passada-unilateral.jpg'),
  'agachamento livre ou no smith': require('./agachamento-livre-ou-no-smith.jpg'),
  'leg press 45°': require('./leg-press-45.jpg'),
  'cadeira extensora': require('./cadeira-extensora.png'),
  'afundo unilateral': require('./afundo-unilateral.jpg'),
  'mesa flexora': require('./mesa-flexora.png'),
  adutora: require('./adutora.png'),
  'panturrilha sentado': require('./panturrilha-sentado.jpg'),
  'panturrilha em pé': require('./panturrilha-em-pe.jpg'),

  // Treino Monstro — D (Peito e tríceps)
  'apoio no chão': require('./apoio-no-chao.jpg'),
  'crucifixo com halter pegada pronada': require('./crucifixo-com-halter-pegada-pronada.jpg'),
  // 'crucifixo com halter pegada neutra': sem foto própria (par do bi-set acima) — placeholder.
  'supino reto': require('./supino-reto.jpg'),
  'crucifixo reto no cross': require('./crucifixo-reto-no-cross.jpg'),
  'supino inclinado': require('./supino-inclinado.png'),
  'crucifixo inclinado com halter': require('./crucifixo-inclinado-com-halter.jpg'),
  voador: require('./voador.jpg'),
  'tríceps testa unilateral no cross': require('./triceps-testa-unilateral-no-cross.jpg'),
  'tríceps no cross com barra w': require('./triceps-no-cross-com-barra-w.jpg'),
  // 'tríceps no cross com barra reta invertida': sem foto própria (par do bi-set acima) — placeholder.
  'tríceps coice': require('./triceps-coice.jpg'),

  // Treino Padrão — Dia 1 (Peito e Tríceps)
  supino: require('./supino.png'),
  fly: require('./fly.png'),
  'tríceps corda': require('./triceps-corda.png'),
  'tríceps francês': require('./triceps-frances.png'),
  'tríceps testa': require('./triceps-testa.png'),

  // Treino Padrão — Dia 2 (Costas e Bíceps)
  'remada curvada': require('./remada-curvada.png'),
  'remada aberta': require('./remada-aberta.png'),
  'puxada aberta': require('./puxada-aberta.png'),
  'rosca scott': require('./rosca-scott.png'),
  'rosca martelo': require('./rosca-martelo.png'),
  'rosca direta': require('./rosca-direta.png'),

  // Treino Padrão — Dia 3 (Perna Completo)
  'agachamento hack': require('./agachamento-hack.png'),
  'cadeira flexora': require('./cadeira-flexora.png'),
  'leg press': require('./leg-press.png'),

  // Treino Padrão — Dia 4 (Ombro Isolado)
  'crucifixo inverso': require('./crucifixo-inverso.png'),
  desenvolvimento: require('./desenvolvimento.png'),

  // Dia 5 (Bíceps e Tríceps) reutiliza os mesmos exercícios dos Dias 1 e 2 — sem chaves novas.
};
