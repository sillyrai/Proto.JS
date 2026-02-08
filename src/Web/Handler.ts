import { Client, ShardingManager, TextChannel, WebhookClient } from 'discord.js';
import Logger from '../Modules/Logger';
import express from 'express';
import mongoose from 'mongoose';
import ejs from 'ejs';

let app = express();
let sMan: ShardingManager;

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');
app.use(express.static(__dirname+'/public'));

app.use((req, res, next) => {
    if (sMan.shards.every(shard => shard.ready)) {
        next();
    } else {
        res.status(503).send('Service Unavailable: Shards are still initializing');
    }
})

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/vote',  async (req, res) => {
    let WC = new WebhookClient({url: process.env.VOTE_WEBHOOK!});
    let voteData = req.body;
    await WC.send(JSON.stringify(voteData));
    res.status(200).send('Vote received');
})

export function startServer(shardingManager:ShardingManager, port: number) {
    mongoose.connect(process.env.MONGODB_URI || '')
        .then(() => Logger.success('Connected to MongoDB (Web Server)'))
        .catch(err => Logger.error(`Failed to connect to MongoDB (Web Server): ${err}`));
    sMan = shardingManager;
    app.listen(port, () => {
        Logger.info(`Web server started on port ${port}`);
    });
}