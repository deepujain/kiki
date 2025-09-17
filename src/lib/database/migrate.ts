import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'better-sqlite3';
// Removed imports to old in-memory stores

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function migrateDatabase() {
    const dbPath = join(process.cwd(), 'crabbie.db');
    
    // Create new database
    const db = new Database(dbPath);
    
    try {
        // Read and execute schema
        const schema = await fs.readFile(
            join(process.cwd(), 'src', 'lib', 'database', 'schema.sql'),
            'utf8'
        );
        
        // Enable foreign keys
        db.pragma('foreign_keys = ON');
        
        // Execute schema
        db.exec(schema);
        
        // No data migration in this file, only schema creation
        
        console.log('Database migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        // Clean up on failure
        db.close();
        fs.unlinkSync(dbPath);
        throw error;
    }
}
