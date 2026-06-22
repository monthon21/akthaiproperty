const fs = require('fs');
const path = require('path');

const directory = 'c:\\Users\\smont\\StormIdea\\akthaiproperty';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Globals.css specific variable replacements
    if (filePath.endsWith('globals.css')) {
        content = content.replace(/--primary: #[0-9a-fA-F]{6};/g, '--primary: #0F172A;');
        content = content.replace(/--primary-dark: #[0-9a-fA-F]{6};/g, '--primary-dark: #020617;');
        content = content.replace(/--primary-light: #[0-9a-fA-F]{6};/g, '--primary-light: #1E293B;');
        content = content.replace(/--background: #[0-9a-fA-F]{6};/g, '--background: #0B1120;');
        content = content.replace(/--card-bg: #[0-9a-fA-F]{6};/g, '--card-bg: #0F172A;');
        content = content.replace(/--card-border: #[0-9a-fA-F]{6};/g, '--card-border: #1E293B;');
    }

    // General HEX replacements for inline Tailwind classes
    content = content.replace(/#111111/gi, '#0B1120');
    content = content.replace(/#1c1c1c/gi, '#0F172A');
    content = content.replace(/#111(?![0-9a-fA-F])/gi, '#0B1120');

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
