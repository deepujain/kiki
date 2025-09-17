import { promises as fs } from 'fs';
import { join } from 'path';
import Database from 'better-sqlite3';

// This file is solely for creating the database schema.
// Data migration happens in scripts/migrate.ts

export async function migrateDatabase() {
    const dbPath = join(process.cwd(), 'attendance.db');
    
    const db = new Database(dbPath);
    
    try {
        const schema = await fs.readFile(
            join(process.cwd(), 'src', 'lib', 'database', 'schema.sql'),
            'utf8'
        );
        
        db.pragma('foreign_keys = ON');
        db.exec(schema);
        
        console.log('Database schema created successfully (attendance.db).');
    } catch (error) {
        console.error('Schema creation failed:', error);
        db.close();
        await fs.unlink(dbPath).catch(() => {}); // Clean up on failure
        throw error;
    } finally {
        db.close();
    }
}
