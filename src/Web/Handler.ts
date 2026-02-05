// API Server
import { WebhookClient } from 'discord.js';
import Logger from '../Modules/Logger';
import express from 'express';
import path from 'path';
import ItemSchema from '../Schemas/ItemSchema';
import mongoose from 'mongoose';

let app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect('/items');
});


app.post('/vote',  async (req, res) => {
    let WC = new WebhookClient({url: process.env.VOTE_WEBHOOK!});
    let voteData = req.body;
    await WC.send(JSON.stringify(voteData));
    res.status(200).send('Vote received');
})

export function startServer(port: number) {
    mongoose.connect(process.env.MONGODB_URI || '')
        .then(() => Logger.success('Connected to MongoDB (Web Server)'))
        .catch(err => Logger.error(`Failed to connect to MongoDB (Web Server): ${err}`));
    
    app.listen(port, () => {
        Logger.info(`Web server started on port ${port}`);
    });
}