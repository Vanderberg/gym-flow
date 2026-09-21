export const TECHNIQUES = ['BI-SET', 'DROP-SET', 'PROGRESSÃO DE CARGA', 'FALHA'] as const;
export type Technique = (typeof TECHNIQUES)[number];
