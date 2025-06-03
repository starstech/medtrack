import fs from 'fs';
import path from 'path';

const srcDir = '/Users/yasser/Cursor Projects/medtrack/src';

function checkImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const importRegex = /import\s+.*?\s+from\s+['"](.*)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];

        // Check if the import is a CSS file
        if (importPath.endsWith('.css')) {
            // Ignore package imports (those that do not start with './' or '../')
            if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
                continue; // Skip package imports
            }

            const fullPath = path.resolve(path.dirname(filePath), importPath);

            if (!fs.existsSync(fullPath)) {
                console.log(`Missing CSS file: ${fullPath}`);
            }
        }
    }
}

function checkDirectory(directory) {
    fs.readdirSync(directory).forEach(file => {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            checkDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            checkImports(fullPath);
        }
    });
}

checkDirectory(srcDir);
