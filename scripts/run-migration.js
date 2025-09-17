import { migrateDatabase } from '../src/lib/database/migrate.js';

async function main() {
    try {
        await migrateDatabase();
        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

main();
