import { ShardingManager } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import Logger from './Modules/Logger';
import fs from 'fs';

dotenv.config({quiet: true});

const manager = new ShardingManager(path.join(__dirname, 'bot.ts'), {
    token: process.env.DISCORD_TOKEN,
    totalShards: 'auto',
    execArgv: ['--import', 'tsx'],
});

manager.on('shardCreate', shard => Logger.info(`Launched shard ${shard.id}`));

Logger.debug('Starting shard manager...');
manager.spawn();

// During development each time this script is ran, some change has been most likely made, so we incriment the patch number in config.version.patch
const configPath = path.join(__dirname, 'config.json');
if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);
    if (config.version && typeof config.version.patch === 'number') {
        config.version.patch += 1;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf-8');
        Logger.info(`Incremented patch version to ${config.version.patch}`);
    } else {
        Logger.warn('Version information not found in config.json');
    } 
} else {
    Logger.warn('config.json file not found, skipping version increment');
}