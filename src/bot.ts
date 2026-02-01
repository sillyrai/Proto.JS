import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import SlashCommandHandler from './Handlers/SlashCommandHandler';
import Logger from './Modules/Logger';
import chalk from 'chalk';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildExpressions,
        GatewayIntentBits.MessageContent]
});

client.on(Events.ClientReady, () => {
    Logger.info(`Bot is online as ${chalk.yellow(client.user?.tag)} on shard ${chalk.yellow(client.shard?.ids)}`);
});

SlashCommandHandler(client);

client.login(process.env.DISCORD_TOKEN);
