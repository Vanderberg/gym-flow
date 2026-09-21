import type { LegendEntry } from '../domain/help/types';

/** Conteúdo estático e informativo da legenda de técnicas (BL-111). */
export const TECHNIQUE_LEGEND: LegendEntry[] = [
  {
    title: 'BI-SET',
    description: 'Dois exercícios diferentes feitos em sequência, sem descanso entre eles.',
  },
  {
    title: 'DROP-SET',
    description: 'Redução da carga logo após uma série, para continuar o exercício sem pausa.',
  },
  { title: 'PIRÂMIDE CRESCENTE', description: 'Aumento progressivo da carga ao longo das séries.' },
  {
    title: 'PIRÂMIDE DECRESCENTE',
    description: 'Redução progressiva da carga ao longo das séries.',
  },
  {
    title: 'FALHA',
    description: 'Execução até não conseguir realizar outra repetição com boa técnica.',
  },
  {
    title: 'EXCÊNTRICA',
    description: 'Fase do movimento em que o músculo se alonga, de retorno da carga.',
  },
  {
    title: 'CONCÊNTRICA',
    description: 'Fase do movimento em que o músculo se contrai e a carga é levantada.',
  },
  {
    title: 'PROGRESSÃO DE CARGA',
    description: 'Aumento gradual da carga ao longo das séries, conforme a prescrição da ficha.',
  },
];
