import type { Migration } from './types';

/** Baseline: sem tabelas; apenas eleva user_version para 1. */
export const baseline: Migration = {
  version: 1,
  async up() {},
};
