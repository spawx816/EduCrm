import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const STDPATH = 'd:/EduC/apps/frontend/src';
const files = execSync('dir /s /b *.tsx *.ts', { cwd: STDPATH })
    .toString()
    .split('\r\n')
    .filter(Boolean);

let changedFiles = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let oldContent = content;

    // Replace >$ or > $  with >RD$ 
    content = content.replace(/>\s*\$(\s*)/g, '>RD$$$1');

    // Replace "$ " (used in placeholders sometimes)
    content = content.replace(/"\$\s/g, '"RD$ ');

    // There are some places that do `${...}` directly out of a tag, let's search if any `\$\s*\{` remains that isn't inside ``
    // We already replaced >$, so `<p>${...}` handled if it was `<p>$ {`. What if it's `<p>${`? It was `>\$`.

    if (content !== oldContent) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
        changedFiles++;
    }
});
console.log('Total files changed:', changedFiles);
