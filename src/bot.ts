import { Client, GatewayIntentBits, Events, Partials } from 'discord.js';
import SlashCommandHandler from './Handlers/SlashCommandHandler';
import Logger from './Modules/Logger';
import chalk from 'chalk';
import mongoose from 'mongoose';
import StarboardHandler from './Handlers/StarboardHandler';
import WelcomerHandler from './Handlers/WelcomerHandler';
import VoteHandler from './Handlers/VoteHandler';
import RandomStatusHandler from './Handlers/RandomStatusHandler';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Message,
        Partials.Reaction,
        Partials.Channel,
        Partials.GuildMember,
    ]
});

client.on(Events.ClientReady, () => {
    Logger.info(`Bot is online as ${chalk.yellow(client.user?.tag)} on shard ${chalk.yellow(client.shard?.ids)}`);
});

mongoose.connect(process.env.MONGODB_URI || '')
    .then(() => Logger.success('Connected to MongoDB'))
    .catch(err => Logger.error(`Failed to connect to MongoDB: ${err}`));

SlashCommandHandler(client);
StarboardHandler(client);
WelcomerHandler(client);
VoteHandler(client);
RandomStatusHandler(client);

client.login(process.env.DISCORD_TOKEN);
