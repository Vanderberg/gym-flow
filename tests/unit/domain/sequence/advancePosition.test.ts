import { advancePosition } from '../../../../src/domain/sequence/services/advancePosition';

describe('advancePosition', () => {
  const all = [1, 2, 3, 4, 5];
  it('avança e volta ao primeiro', () => {
    expect(advancePosition(1, all)).toBe(2);
    expect(advancePosition(3, all)).toBe(4);
    expect(advancePosition(5, all)).toBe(1);
  });
  it('pula lacunas', () => {
    expect(advancePosition(2, [1, 2, 4, 5])).toBe(4);
    expect(advancePosition(5, [1, 2, 4, 5])).toBe(1);
  });
  it('sem correspondência conta como a primeira', () => {
    expect(advancePosition(3, [1, 2, 4, 5])).toBe(2);
    expect(advancePosition(null, all)).toBe(2);
    expect(advancePosition(0, all)).toBe(2);
  });
  it('lista de um elemento', () => {
    expect(advancePosition(7, [7])).toBe(7);
  });
});
