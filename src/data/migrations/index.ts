import { baseline } from './0001-baseline';
import { schema } from './0002-schema';
import type { Migration } from './types';

export const migrations: Migration[] = [baseline, schema];
