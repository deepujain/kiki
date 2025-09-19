import { join } from 'path';
import { promises as fs } from 'fs';
import Database from 'better-sqlite3';

async function migrateDatabase() {
    const dbPath = join(process.cwd(), 'attendance.db');
    
    // Remove existing database file if it exists
    try {
        await fs.unlink(dbPath);
        console.log(`Removed existing database: ${dbPath}`);
    } catch (error: any) {
        if (error.code !== 'ENOENT') {
            console.error('Error removing database file:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
            process.exit(1);
        }
    }
    
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
        
        console.log('Database migration completed successfully: Empty tables created.');
    } catch (error: any) {
        console.error('Migration failed:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        // Clean up on failure
        db.close();
        await fs.unlink(dbPath).catch(() => {});
        throw error;
    } finally {
        db.close();
    }
}

// Run migration
migrateDatabase().catch(error => {
    console.error('Migration failed:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', JSON.stringify(reason, Object.getOwnPropertyNames(reason)));
    process.exit(1);
});
