import { Client } from 'pg';

const url = 'postgresql://educrm_user:PasswordFuerte123@136.111.157.71:5432/educrm?schema=public';

async function addAddressColumn() {
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        await client.query('ALTER TABLE leads ADD COLUMN IF NOT EXISTS address TEXT');
        console.log('Successfully added address column to leads table');
    } catch (e) {
        console.error('Error adding column:', e);
    } finally {
        await client.end();
    }
}

addAddressColumn();
