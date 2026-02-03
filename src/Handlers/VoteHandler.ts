import { Client, ContainerBuilder, EmbedBuilder, Events, MessageFlags, SeparatorBuilder, TextDisplayBuilder, WebhookClient } from "discord.js";
import Logger from "../Modules/Logger";
import Database from "../Modules/Database";
import TextParser from "../Modules/TextParser";
let WC = new WebhookClient({url: process.env.VOTE_WEBHOOK!});
export default function(client: Client) {
    client.on(Events.MessageCreate, async (message) => {
        if(message.channelId !== process.env.VOTE_WEBHOOK_CHANNEL) return;
        try{
            let Amount = 500n;
            let voteData = JSON.parse(message.content);
            let userId = voteData.user;
            let user = await client.users.fetch(userId);
            if(!user) {
                Logger.warn(`Vote received for unknown user ID: ${userId}`);
                return;
            }

            let dbUser = await Database.getUser(userId)
            let balance = dbUser.economy.balance;
            dbUser.economy.balance = (BigInt(dbUser.economy.balance) + Amount).toString();
            dbUser.save();

            let Container = new ContainerBuilder();
            Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`:ballot_box: Vote Rewards!`))
            Container.addSeparatorComponents(new SeparatorBuilder());
            Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`Thank you for voting, ${user}!
As a reward, you have received **${Amount}** coins.
${TextParser.NumDiffBigInt(balance, dbUser.economy.balance)}`));
            try{
                await user.send({
                    components: [Container],
                    flags: [MessageFlags.IsComponentsV2]
                })
            }
            catch(err){
                Logger.warn(`Could not send vote reward DM to user ${user.tag} (${user.id}). They might have DMs disabled.`);
            }

            let Embed = new EmbedBuilder()
            Embed.setAuthor({name: user ? user.tag : "Unknown User", iconURL: user ? user.displayAvatarURL() : undefined});
            Embed.setTitle("New Vote Received!");
            Embed.setDescription(`**User:** ${user ? `<@${user.id}>` : "Unknown User"}\n**Vote Type:** ${voteData.type}`);
            Embed.setThumbnail(user.displayAvatarURL())
            Embed.setTimestamp();
            await WC.send({embeds: [Embed]});
        } catch (err) {
            Logger.error(`Failed to process vote message: ${err}, probably not a vote message.`);
        }
    })
}