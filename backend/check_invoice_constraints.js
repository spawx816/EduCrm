const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    const query = `
        SELECT 
            tc.table_name as source_table, 
            kcu.column_name as source_column, 
            ccu.table_name AS target_table, 
            ccu.column_name AS target_column 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name 
        JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name 
        WHERE tc.constraint_type = 'FOREIGN KEY' AND (tc.table_name = 'invoices' OR ccu.table_name = 'invoices');
    `;
    conn.exec(`PGPASSWORD='EducrmSecurePass2026!' psql -U educrm_user -h 127.0.0.1 -d educrm -c "${query}"`, (err, stream) => {
        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect({ host: '74.208.192.253', port: 22, username: 'deploy', password: 'Arrd1227' });
