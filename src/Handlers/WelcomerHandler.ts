import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ContainerBuilder, Events, FileBuilder, GuildMember, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, MessageReaction, PartialGuildMember, PartialMessageReaction, PartialUser, SectionBuilder, SeparatorBuilder, TextChannel, TextDisplayBuilder, ThumbnailBuilder, User } from "discord.js";
import Logger from "../Modules/Logger";
import Database from "../Modules/Database";

function ConvertVariables(member:GuildMember|PartialGuildMember, message:string):string {
    /* Variable conversions
    {user.username} - The username of the user
    {user.mention} - The mention of the user
    {user.displayName} - The display name of the user
    {user.id} - The ID of the user

    {guild.name} - The name of the server
    {guild.memberCount} - The member count of the server
    {guild.id} - The ID of the server
    */
    let guild = member.guild;

    message = message.replace(/{user\.username}/g, member.user?.username || 'Unknown User');
    message = message.replace(/{user\.mention}/g, `<@${member.id}>`);
    message = message.replace(/{user\.displayName}/g, member.displayName || member.user?.username || 'Unknown User');
    message = message.replace(/{user\.id}/g, member.id);
    message = message.replace(/{guild\.name}/g, guild.name);
    message = message.replace(/{guild\.memberCount}/g, guild.memberCount.toString());
    message = message.replace(/{guild\.id}/g, guild.id);
    
    return message;
}

export default function(client: Client) {
    Logger.info("Initializing Welcome Handler");
    client.on(Events.GuildMemberAdd, async (member) => {
        let guild = member.guild;
        let dbGuild = await Database.getGuild(guild.id);

        if(!dbGuild.welcomer.enabled) return;

        let channelId = dbGuild.welcomer.channel;
        if(!channelId) return;

        let channel = await guild.channels.fetch(channelId);
        if(!channel || !channel.isTextBased()) return;

        let welcomeMessage = dbGuild.welcomer.joinMessage;
        if(!welcomeMessage) return;

        welcomeMessage = ConvertVariables(member, welcomeMessage);

        await channel.send({ content: welcomeMessage });
    })

    client.on(Events.GuildMemberRemove, async (member) => {
        let guild = member.guild;
        let dbGuild = await Database.getGuild(guild.id);
        if(!dbGuild.welcomer.enabled) return;

        let channelId = dbGuild.welcomer.channel;
        if(!channelId) return;
        let channel = await guild.channels.fetch(channelId);
        if(!channel || !channel.isTextBased()) return;

        let leaveMessage = dbGuild.welcomer.leaveMessage;
        if(!leaveMessage) return;

        leaveMessage = ConvertVariables(member, leaveMessage);

        await channel.send({ content: leaveMessage });
    })
}