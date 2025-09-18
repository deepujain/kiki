import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'attendance.db');
const db = new Database(dbPath);

try {
  db.pragma('journal_mode = WAL');
  const testStmt = db.prepare('CREATE TABLE IF NOT EXISTS test_write (id INTEGER PRIMARY KEY, value TEXT)');
  testStmt.run();

  const insertStmt = db.prepare('INSERT INTO test_write (value) VALUES (?)');
  insertStmt.run('Hello from test script');

  const count = db.prepare('SELECT COUNT(*) FROM test_write').get() as { 'COUNT(*)': number };
  console.log();
} catch (error) {
  console.error('Error writing to database:', error);
} finally {
  db.close();
}
