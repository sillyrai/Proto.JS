import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

config({quiet: true }); // Load .env file contents into process.env

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

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
    console.error("Missing environment variables: ensure DISCORD_TOKEN and CLIENT_ID are set in .env");
    process.exit(1);
}

const rest = new REST().setToken(token);
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands globally.`);
        const data: any = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands globally.`);
    } catch (error) {
        console.error(error);
    }
})();
