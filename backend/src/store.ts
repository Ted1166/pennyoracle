import Database from 'better-sqlite3';
import { config } from './config';
import { QuestionRecord } from './types';

const db = new Database(config.dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  asker TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  answer_hash TEXT,
  fulfilled INTEGER NOT NULL DEFAULT 0,
  asked_at INTEGER NOT NULL,
  fulfilled_at INTEGER
)
`);

export function insertAsked(id: string, asker: string, question: string, askedAt: number) {
  db.prepare(
    'INSERT OR IGNORE INTO questions (id, asker, question, fulfilled, asked_at) VALUES (?, ?, ?, 0, ?)'
  ).run(id, asker, question, askedAt);
}

export function markFulfilled(id: string, answer: string, answerHash: string, fulfilledAt: number) {
  db.prepare(
    'UPDATE questions SET answer = ?, answer_hash = ?, fulfilled = 1, fulfilled_at = ? WHERE id = ?'
  ).run(answer, answerHash, fulfilledAt, id);
}

export function getFeed(limit: number, offset: number): QuestionRecord[] {
  const rows = db
    .prepare(
      'SELECT * FROM questions WHERE fulfilled = 1 ORDER BY CAST(id AS INTEGER) DESC LIMIT ? OFFSET ?'
    )
    .all(limit, offset) as Record<string, unknown>[];
  return rows.map(mapRow);
}

export function getHistory(asker: string, limit: number, offset: number): QuestionRecord[] {
  const rows = db
    .prepare(
      'SELECT * FROM questions WHERE LOWER(asker) = LOWER(?) ORDER BY CAST(id AS INTEGER) DESC LIMIT ? OFFSET ?'
    )
    .all(asker, limit, offset) as Record<string, unknown>[];
  return rows.map(mapRow);
}

export function getById(id: string): QuestionRecord | null {
  const row = db.prepare('SELECT * FROM questions WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapRow(row) : null;
}

function mapRow(row: Record<string, unknown>): QuestionRecord {
  return {
    id: row.id as string,
    asker: row.asker as string,
    question: row.question as string,
    answer: (row.answer as string | null) ?? null,
    answerHash: (row.answer_hash as string | null) ?? null,
    fulfilled: Boolean(row.fulfilled),
    askedAt: row.asked_at as number,
    fulfilledAt: (row.fulfilled_at as number | null) ?? null
  };
}
