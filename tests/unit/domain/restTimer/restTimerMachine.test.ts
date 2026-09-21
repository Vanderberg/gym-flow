import {
  dismiss,
  evaluate,
  pause,
  remainingMs,
  resume,
  start,
  stop,
} from '@/domain/restTimer/restTimerMachine';

const T = 1_000_000;

describe('restTimerMachine', () => {
  it('start cria RUNNING com endsAt', () => {
    expect(start(90, T)).toEqual({ status: 'RUNNING', endsAt: T + 90000, durationMs: 90000 });
  });
  it('remainingMs cai com o relógio e nunca é negativo', () => {
    const s = start(90, T);
    expect(remainingMs(s, T + 30000)).toBe(60000);
    expect(remainingMs(s, T + 999999)).toBe(0);
  });
  it('pause e resume continuam de onde parou', () => {
    const p = pause(start(90, T), T + 30000);
    expect(p).toEqual({ status: 'PAUSED', remainingMs: 60000, durationMs: 90000 });
    expect(remainingMs(p, T + 500000)).toBe(60000);
    expect(resume(p, T + 100000)).toEqual({
      status: 'RUNNING',
      endsAt: T + 160000,
      durationMs: 90000,
    });
  });
  it('start reinicia da duração cheia', () => {
    expect(start(60, T + 5000)).toEqual({
      status: 'RUNNING',
      endsAt: T + 65000,
      durationMs: 60000,
    });
  });
  it('evaluate: antes do fim mantém, no fim e depois termina', () => {
    const s = start(10, T);
    expect(evaluate(s, T + 9999)).toEqual({ state: s, justFinished: false });
    expect(evaluate(s, T + 10000)).toEqual({ state: { status: 'FINISHED' }, justFinished: true });
    expect(evaluate(s, T + 11500)).toEqual({ state: { status: 'FINISHED' }, justFinished: true });
  });
  it('evaluate: observação tardia (segundo plano) não é justFinished', () => {
    expect(evaluate(start(10, T), T + 40000)).toEqual({
      state: { status: 'FINISHED' },
      justFinished: false,
    });
  });
  it('stop e dismiss levam a IDLE; pause/resume fora do estado não mudam', () => {
    expect(stop(start(10, T))).toEqual({ status: 'IDLE' });
    expect(dismiss({ status: 'FINISHED' })).toEqual({ status: 'IDLE' });
    const idle = { status: 'IDLE' } as const;
    expect(pause(idle, T)).toBe(idle);
    expect(pause({ status: 'FINISHED' }, T)).toEqual({ status: 'FINISHED' });
    const running = start(10, T);
    expect(resume(running, T)).toBe(running);
  });
  it('erro < 1 s após 5 minutos, mesmo com salto do relógio', () => {
    const s = start(300, T);
    expect(remainingMs(s, T + 299_500)).toBe(500);
    expect(evaluate(s, T + 300_000).state.status).toBe('FINISHED');
  });
});
