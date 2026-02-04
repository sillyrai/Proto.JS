import { ShardingManager, WebhookClient } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import Logger from './Modules/Logger';

dotenv.config({quiet: true});

const manager = new ShardingManager(path.join(__dirname, 'bot.ts'), {
    token: process.env.DISCORD_TOKEN,
    totalShards: 'auto',
    execArgv: ['--import', 'tsx'],
});

manager.on('shardCreate', shard => Logger.info(`Launched shard ${shard.id}`));

Logger.debug('Starting shard manager...');
manager.spawn();

import { startServer } from './Web/Handler';

startServer(3000);