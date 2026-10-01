import { resolveExerciseImage } from '../../../../src/components/workout/ExerciseImage';

describe('resolveExerciseImage', () => {
  it('resolve a imagem cadastrada para o nome exato do exercício', () => {
    expect(resolveExerciseImage('Supino reto')).not.toBeNull();
  });

  it('resolve a mesma imagem independente de maiúsculas/acentuação (mesma normalização do name_key)', () => {
    const exact = resolveExerciseImage('Supino reto');
    expect(resolveExerciseImage('supino   reto')).toBe(exact);
    expect(resolveExerciseImage('SUPINO RETO')).toBe(exact);
  });

  it('retorna null para um exercício sem imagem cadastrada', () => {
    expect(resolveExerciseImage('Exercício sem imagem cadastrada 123')).toBeNull();
  });

  it('retorna null para exercício conhecido que ainda não tem foto própria (gap de bi-set)', () => {
    expect(resolveExerciseImage('Remada cavalinho pegada neutra')).toBeNull();
  });

  it('retorna null (placeholder) em vez de lançar erro para nome vazio ou só espaços', () => {
    expect(resolveExerciseImage('')).toBeNull();
    expect(resolveExerciseImage('   ')).toBeNull();
  });
});
