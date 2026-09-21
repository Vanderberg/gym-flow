export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/** Traduz erros de constraint do SQLite; repassa os demais. */
export function translateSqliteError(e: unknown): Error {
  if (e instanceof ValidationError || e instanceof ConflictError || e instanceof NotFoundError) {
    return e;
  }
  const msg = e instanceof Error ? e.message : String(e);
  if (/UNIQUE constraint failed/i.test(msg) || /FOREIGN KEY constraint failed/i.test(msg)) {
    return new ConflictError('Conflito de integridade');
  }
  if (/CHECK constraint failed/i.test(msg) || /NOT NULL constraint failed/i.test(msg)) {
    return new ValidationError('Valor inválido');
  }
  return e instanceof Error ? e : new Error(msg);
}

export async function guard<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (e) {
    throw translateSqliteError(e);
  }
}
