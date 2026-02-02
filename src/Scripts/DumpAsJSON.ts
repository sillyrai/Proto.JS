import fs from 'fs';
import path from 'path';
import { SlashCommandBuilder } from 'discord.js';

interface SlashCommand {
    data: SlashCommandBuilder;
}

const commands: any[] = [];
const slashCommandsDir = path.join(__dirname, '../Commands/Slash');

function getCommandFiles(dir: string): string[] {
    let files: string[] = [];
    if (!fs.existsSync(dir)) return files;
    
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

console.log("Scanning for commands...");
const commandFiles = getCommandFiles(slashCommandsDir);

for (const file of commandFiles) {
    try {
        // Clear cache to ensure fresh require
        delete require.cache[require.resolve(file)];
        const commandModule = require(file);
        const command = commandModule.default || commandModule;

        if (command && command.data) {
            // Convert to JSON structure
            commands.push(command.data.toJSON());
            console.log(`Processed: ${command.data.name}`);
        }
    } catch (error) {
        console.error(`Error processing ${file}:`, error);
    }
}

const outputPath = path.join(process.cwd(), 'commands_dump.json');
fs.writeFileSync(outputPath, JSON.stringify(commands, null, 4));

console.log(`\nSuccessfully dumped ${commands.length} commands to:`);
console.log(outputPath);
