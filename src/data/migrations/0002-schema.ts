import type { Migration } from './types';

export const schema: Migration = {
  version: 2,
  async up(db) {
    await db.exec(`
CREATE TABLE training_program (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    home_suggestion TEXT,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE TABLE workout (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL REFERENCES training_program(id),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    position INTEGER NOT NULL CHECK (position >= 1),
    warmup_note TEXT,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
    UNIQUE (program_id, code),
    UNIQUE (program_id, position)
);
CREATE TABLE exercise (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_key TEXT NOT NULL UNIQUE,
    muscle_group TEXT,
    primary_muscle TEXT,
    secondary_muscles TEXT,
    description TEXT,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1))
);
CREATE TABLE workout_exercise (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL REFERENCES workout(id),
    exercise_id INTEGER NOT NULL REFERENCES exercise(id),
    display_order INTEGER NOT NULL,
    prescription TEXT,
    technique TEXT,
    notes TEXT,
    UNIQUE (workout_id, exercise_id)
);
CREATE TABLE weekly_schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL REFERENCES training_program(id),
    weekday INTEGER NOT NULL CHECK (weekday BETWEEN 1 AND 7),
    workout_id INTEGER REFERENCES workout(id),
    optional INTEGER NOT NULL DEFAULT 0 CHECK (optional IN (0,1)),
    note TEXT,
    UNIQUE (program_id, weekday)
);
CREATE TABLE program_sequence_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL UNIQUE REFERENCES training_program(id),
    current_position INTEGER NOT NULL CHECK (current_position >= 1),
    updated_at TEXT NOT NULL
);
CREATE TABLE workout_session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL REFERENCES training_program(id),
    workout_id INTEGER NOT NULL REFERENCES workout(id),
    started_at TEXT NOT NULL,
    finished_at TEXT,
    completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0,1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    CHECK (completed = 0 OR finished_at IS NOT NULL)
);
CREATE UNIQUE INDEX ux_workout_session_in_progress
    ON workout_session ((1)) WHERE finished_at IS NULL;
CREATE INDEX ix_workout_session_program_finished
    ON workout_session (program_id, finished_at);
CREATE TABLE workout_session_exercise (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES workout_session(id),
    exercise_id INTEGER NOT NULL REFERENCES exercise(id),
    completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0,1)),
    weight REAL CHECK (weight IS NULL OR weight >= 0),
    updated_at TEXT NOT NULL,
    UNIQUE (session_id, exercise_id)
);
CREATE TABLE app_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    active_program_id INTEGER NOT NULL REFERENCES training_program(id),
    sequence_type TEXT NOT NULL CHECK (sequence_type IN ('CONTINUOUS','WEEKLY')),
    rest_timer_enabled INTEGER NOT NULL DEFAULT 0 CHECK (rest_timer_enabled IN (0,1)),
    rest_timer_seconds INTEGER NOT NULL DEFAULT 90 CHECK (rest_timer_seconds > 0),
    updated_at TEXT NOT NULL
);`);
  },
};
