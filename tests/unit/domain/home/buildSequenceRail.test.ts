import { buildSequenceRail } from '../../../../src/domain/home/buildSequenceRail';

const ws = [1, 2, 3, 4, 5].map((p) => ({ code: String(p), position: p }));
const states = (r: { state: string }[]) => r.map((s) => s.state);

describe('buildSequenceRail', () => {
  it('marca DONE/CURRENT/PENDING', () => {
    expect(states(buildSequenceRail(ws, 3))).toEqual([
      'DONE',
      'DONE',
      'CURRENT',
      'PENDING',
      'PENDING',
    ]);
  });
  it('posição nula, inválida ou ausente: primeiro é CURRENT', () => {
    for (const p of [null, 99, 0]) {
      expect(states(buildSequenceRail(ws, p))[0]).toBe('CURRENT');
      expect(states(buildSequenceRail(ws, p))).not.toContain('DONE');
    }
  });
  it('respeita lacunas nas posições', () => {
    const gap = [1, 2, 4, 5].map((p) => ({ code: `W${p}`, position: p }));
    expect(states(buildSequenceRail(gap, 4))).toEqual(['DONE', 'DONE', 'CURRENT', 'PENDING']);
    expect(buildSequenceRail(gap, 3)[0].state).toBe('CURRENT');
  });
  it('lista vazia', () => {
    expect(buildSequenceRail([], 1)).toEqual([]);
  });
});
