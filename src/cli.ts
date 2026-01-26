#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const fileName = 'EmessageGlobal';
const jsContent = `export const Emessage_global = [
    {
        GLOBAL_ERROR_MESSAGE: "Global error message.",
        type:"war",
        break:false,
        toast: true
    },
    // {
    //     Add your custom global messages here.
    // }
];
`;

const tsContent = `export const Emessage_global = [
    {
        GLOBAL_ERROR_MESSAGE: "Global error message.",
        type:"war",
        break:false,
        toast: true
    },
    // {
    //     Add your custom global messages here.
    // }
];
`;

function findProjectRoot(startDir: string): string | null {
    let currentDir = startDir;
    while (currentDir !== path.parse(currentDir).root) {
        if (fs.existsSync(path.join(currentDir, 'package.json'))) {
            return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }
    return null;
}

function generateGlobalEmessageFile() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('You want to create EmessageGlobal file: (y) ', (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes' || answer === '') {
            const cwd = process.cwd();
            const projectRoot = findProjectRoot(cwd);

            if (!projectRoot) {
                console.error('Error: Could not find project root (package.json not found).');
                process.exit(1);
            }

            const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
            const isTypeScriptProject = fs.existsSync(tsconfigPath);

            const fileExtension = isTypeScriptProject ? 'ts' : 'js';
            const content = isTypeScriptProject ? tsContent : jsContent;
            const outputFileName = `${fileName}.${fileExtension}`;
            const outputPath = path.join(projectRoot, outputFileName);

            if (fs.existsSync(outputPath)) {
                console.warn(`Warning: ${outputFileName} already exists. Skipping file creation.`);
                process.exit(0);
            }

            try {
                fs.writeFileSync(outputPath, content, 'utf8');
                console.log(`Successfully created ${outputFileName} in your project root.`);
                console.log('You can now configure global messages by editing this file.');
            } catch (error: any) {
                console.error(`Error creating ${outputFileName}:`, error.message);
                process.exit(1);
            }
        }
        rl.close();
    });
}

generateGlobalEmessageFile();
