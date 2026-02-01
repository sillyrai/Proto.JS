import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.MessageContent]
});

client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}! Shard ID: ${client.shard?.ids}`);
});

client.login(process.env.DISCORD_TOKEN);
