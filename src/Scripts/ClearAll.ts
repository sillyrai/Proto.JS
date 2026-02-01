import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';

config({quiet: true });

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
        console.log('Started clearing application (/) commands.');

        // Clear Global Commands
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: [] },
        );
        console.log('Successfully deleted all global application commands.');

        // Clear Guild Commands
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: [] },
        );
        console.log('Successfully deleted all guild application commands.');

    } catch (error) {
        console.error(error);
    }
})();
