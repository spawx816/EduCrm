const fs = require('fs');
const path = require('path');

const dirs = [
    path.join(__dirname, 'sql'),
    path.join(__dirname, 'sql/migrations')
];

let count = 0;

for (const dir of dirs) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (file.endsWith('.sql')) {
            const filePath = path.join(dir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('uuid_generate_v4()')) {
                content = content.replace(/uuid_generate_v4\(\)/g, 'gen_random_uuid()');
                fs.writeFileSync(filePath, content);
                console.log(`Updated ${file} in ${dir}`);
                count++;
            }
        }
    });
}
console.log(`Total files updated: ${count}`);
