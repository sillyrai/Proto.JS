import { ShardingManager } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({quiet: true});

const manager = new ShardingManager(path.join(__dirname, 'bot.ts'), {
    token: process.env.DISCORD_TOKEN,
    totalShards: 2,
    execArgv: ['--import', 'tsx'],
});

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();
