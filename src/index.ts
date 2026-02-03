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


// API Server
import express from 'express';
let app = express();
app.use(express.json());

app.post('/vote',  async (req, res) => {
    let WC = new WebhookClient({url: process.env.VOTE_WEBHOOK!});
    let voteData = req.body;
    await WC.send(JSON.stringify(voteData));
    res.status(200).send('Vote received');
})

app.listen(3000, () => {
    Logger.info('Vote API server is running on port 3000');
})