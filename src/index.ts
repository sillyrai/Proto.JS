import { ShardingManager } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import Logger from './Modules/Logger';
import fs from 'fs';
import mongoose from 'mongoose';

dotenv.config({quiet: true});

const manager = new ShardingManager(path.join(__dirname, 'bot.ts'), {
    token: process.env.DISCORD_TOKEN,
    totalShards: 'auto',
    execArgv: ['--import', 'tsx'],
});

manager.on('shardCreate', shard => Logger.info(`Launched shard ${shard.id}`));

Logger.debug('Starting shard manager...');
manager.spawn();

mongoose.connect(process.env.MONGODB_URI || '', {})
    .then(() => Logger.success('Connected to MongoDB'))
    .catch(err => Logger.error(`Failed to connect to MongoDB: ${err}`));