import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

config({ quiet: true });

const commands: any[] = [];
const foldersPath = path.join(__dirname, '../Commands/Slash');

if (fs.existsSync(foldersPath)) {
    function getCommandFiles(dir: string): string[] {
        let files: string[] = [];
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                if (item.name.toLowerCase() === 'subcommands') continue;
                files = files.concat(getCommandFiles(fullPath));
            } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.js'))) {
                files.push(fullPath);
            }
        }
        return files;
    }

    const commandFiles = getCommandFiles(foldersPath);

    for (const filePath of commandFiles) {
        const command = require(filePath);
        // Handle both standard export and default export
        const commandData = command.data || command.default?.data;

        if (commandData && typeof commandData.toJSON === 'function') {
            commands.push(commandData.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" property.`);
        }
    }
} else {
    console.warn(`[WARNING] The commands directory at ${foldersPath} does not exist.`);
}

const outputPath = path.join(process.cwd(), 'topgg_commands.json');

try {
    fs.writeFileSync(outputPath, JSON.stringify(commands, null, 2));
    console.log(`Successfully generated command dump for Top.gg.`);
    console.log(`File saved to: ${outputPath}`);
    console.log(`Total commands: ${commands.length}`);
} catch (error) {
    console.error('Error writing commands file:', error);
    process.exit(1);
}
