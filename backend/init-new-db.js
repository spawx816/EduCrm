const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public',
    ssl: false
});

const baseModules = [
    'schema.sql',
    'academic_advanced.sql',
    'academic_modular.sql',
    'modular_pricing.sql',
    'enrollment_pricing.sql',
    'automated_billing.sql',
    'scholarships.sql',
    'expenses_module.sql',
    'instructor_payroll.sql'
];

async function runSchemaAndSeeds() {
    try {
        console.log('--- Initializing Database ---');
        console.log('--- Resetting Schema ---');
        await pool.query('DROP SCHEMA IF EXISTS public CASCADE;');
        await pool.query('CREATE SCHEMA public;');

        // 1. Run base modules in order
        for (const mod of baseModules) {
            console.log(`Applying base module: ${mod}...`);
            const sqlPath = path.join(__dirname, 'sql', mod);
            if (fs.existsSync(sqlPath)) {
                const sql = fs.readFileSync(sqlPath, 'utf8');
                await pool.query(sql);
            } else {
                console.warn(`WARNING: Base module ${mod} not found!`);
            }
        }

        // 2. Run migrations
        console.log('Running migrations...');
        const migrationsDir = path.join(__dirname, 'sql/migrations');
        const files = fs.readdirSync(migrationsDir).sort(); // Sort to run in order

        for (const file of files) {
            if (file.endsWith('.sql')) {
                console.log(`Applying migration: ${file}...`);
                const migrationSql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                await pool.query(migrationSql);
            }
        }

        console.log('--- Database successfully migrated and prepared! ---');
    } catch (error) {
        console.error('Error migrating database:', error);
    } finally {
        await pool.end();
    }
}

runSchemaAndSeeds();
