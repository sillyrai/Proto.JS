import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

config({quiet: true }); // Load .env file contents into process.env

const commands: any[] = [];
const foldersPath = path.join(__dirname, '../Commands/Slash');

if (fs.existsSync(foldersPath)) {
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        if (!fs.lstatSync(commandsPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            const commandData = command.data || command.default?.data;

            if (commandData && typeof commandData.toJSON === 'function') {
                commands.push(commandData.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" property.`);
            }
        }
    }
} else {
    console.warn(`[WARNING] The commands directory at ${foldersPath} does not exist.`);
}

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.DEV_SERVER_ID;

if (!token || !clientId || !guildId) {
    console.error("Missing environment variables: ensure DISCORD_TOKEN, CLIENT_ID, and DEV_SERVER_ID are set in .env");
    process.exit(1);
}

const rest = new REST().setToken(token);
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data: any = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();