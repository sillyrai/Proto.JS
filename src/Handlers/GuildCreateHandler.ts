import { Client, ContainerBuilder, EmbedBuilder, Events, MessageFlags, SeparatorBuilder, TextDisplayBuilder, WebhookClient } from "discord.js";
import Logger from "../Modules/Logger";
import Database from "../Modules/Database";
import TextParser from "../Modules/TextParser";
let WC = new WebhookClient({url: process.env.GUILD_LOG_WEBHOOK!});
export default function(client: Client) {
    client.on(Events.GuildCreate, async (guild) => {
        try{
            let Embed = new EmbedBuilder()
            Embed.setTitle("Joined a new guild!")
            Embed.setDescription(`**Guild Name:** ${guild.name}\n**Guild ID:** ${guild.id}\n**Member Count:** ${guild.memberCount}`)
            Embed.setThumbnail(guild.iconURL()!)
            Embed.setTimestamp();
            Embed.setColor("Green");
            await WC.send({embeds: [Embed]});
        } catch (err) {
            Logger.error(`Failed to send guild join message: ${err}`);
        }
    })

    client.on(Events.GuildDelete, async (guild) => {
        try{
            let Embed = new EmbedBuilder()
            Embed.setTitle("Left a guild")
            Embed.setDescription(`**Guild Name:** ${guild.name}\n**Guild ID:** ${guild.id}\n**Member Count:** ${guild.memberCount}`)
            Embed.setThumbnail(guild.iconURL()!)
            Embed.setTimestamp();
            Embed.setColor("Red");
            await WC.send({embeds: [Embed]});
        } catch (err) {
            Logger.error(`Failed to send guild leave message: ${err}`);
        }
    })
}