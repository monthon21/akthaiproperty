const fs = require('fs');
const path = require('path');

const directory = 'c:\\Users\\smont\\StormIdea\\akthaiproperty';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/#0B1120/gi, '#0A192F');
    content = content.replace(/#0F172A/gi, '#112240');
    content = content.replace(/#1E293B/gi, '#233554');
    content = content.replace(/#020617/gi, '#020C1B');

    // Just in case any remain
    content = content.replace(/#111111/gi, '#0A192F');
    content = content.replace(/#1c1c1c/gi, '#112240');
    content = content.replace(/#111(?![0-9a-fA-F])/gi, '#0A192F');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                walkDir(fullPath);
            }
        } else {
            if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
                replaceInFile(fullPath);
            }
        }
    }
}

walkDir(directory);
console.log('Color replacement complete.');
