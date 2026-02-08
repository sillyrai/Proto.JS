import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ContainerBuilder, Events, FileBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, MessageReaction, PartialMessageReaction, PartialUser, SectionBuilder, SeparatorBuilder, TextChannel, TextDisplayBuilder, ThumbnailBuilder, User } from "discord.js";
import Logger from "../Modules/Logger";
import Database from "../Modules/Database";

export async function PostToStarboard(reaction: MessageReaction | PartialMessageReaction, starboardChannel:TextChannel, dbGuild:any) {
    let message = await reaction.message.fetch();

    // Check if guild.starboard.posted already has this message ID
    if(dbGuild.starboard.posted.includes(message.id)) return;
    // Add message ID to guild.starboard.posted and save
    dbGuild.starboard.posted.push(message.id);
    await dbGuild.save();

    // Create the starboard embed/message
    let Container = new ContainerBuilder();
    Container.addSectionComponents(new SectionBuilder()
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(message.author?.displayAvatarURL() || ''))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${dbGuild.starboard.emoji} Starboard\n
Post by **${message.author}**
<t:${Math.floor(message.createdTimestamp / 1000)}:R>`))
    );
    Container.setAccentColor(16361522);
    Container.addSeparatorComponents(new SeparatorBuilder())

    if(message.content) {
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(message.content));
    }
    let MediaGallery = new MediaGalleryBuilder()
    let MediaText = "";
    if(message.attachments.size > 0)
        for(const attachment of message.attachments.values()){
                if(attachment.contentType?.startsWith('image/') || attachment.contentType?.startsWith('video/'))
                    MediaGallery.addItems(new MediaGalleryItemBuilder().setURL(attachment.url));
                MediaText += `\n📑 [${attachment.name}](${attachment.url})`;
            }
    if(MediaGallery.items.length > 0)
        Container.addMediaGalleryComponents(MediaGallery);
    if(MediaText.length > 0){
        Container.addSeparatorComponents(new SeparatorBuilder())
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(MediaText));
    }

    let ButtonRow = new ActionRowBuilder<ButtonBuilder>()
    ButtonRow.addComponents(
        new ButtonBuilder()
            .setLabel('View Original Message')
            .setStyle(ButtonStyle.Link)
            .setURL(message.url)
    );

    // Send the starboard message
    await starboardChannel.send({ 
        components: [Container, ButtonRow],
        flags: [MessageFlags.IsComponentsV2]
    });
}

export default function(client: Client) {
    Logger.info("Initializing Starboard Handler");
    client.on(Events.MessageReactionAdd, async (reaction, user, details) => {
        await reaction.fetch();
        
        let emojiName = reaction.emoji.id ? `<${reaction.emoji.animated ? 'a' : ''}:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;
        if(!emojiName) return;

        // Get current guild info
        let guild = reaction.message.guild;
        if(!guild) return;

        let dbGuild = await Database.getGuild(guild.id);
        if(!dbGuild.starboard.enabled) return;

        // Check if the reaction emoji matches the starboard emoji
        if(emojiName !== dbGuild.starboard.emoji) return;

        // Check if the reaction count meets the threshold
        let reactionCount = reaction.count || 0;
        if(reactionCount < dbGuild.starboard.threshold) return;

        // Fetch the starboard channel
        let starboardChannelId = dbGuild.starboard.channel;
        if(!starboardChannelId) return;

        // if starboard channel is the same as the message channel, return
        if(starboardChannelId === reaction.message.channelId) return;

        try{
            let starboardChannel = await guild.channels.fetch(starboardChannelId) as TextChannel;
            if(!starboardChannel || !starboardChannel.isTextBased()) return;

            // if starred message is in a nsfw channel and starboard channel is not nsfw, return
            let reactionMessageChannel = await reaction.message.channel.fetch() as TextChannel;
            if(reactionMessageChannel.nsfw && !starboardChannel.nsfw) return;

            // Post to starboard
            await PostToStarboard(reaction, starboardChannel as TextChannel, dbGuild);
        }
        catch(err){
            Logger.error("Error fetching starboard channel or posting to starboard:" + err);
            // Could not fetch starboard channel, possibly deleted or missing permissions
            // Disable starboard in the database
            dbGuild.starboard.enabled = false;
            await dbGuild.save();
            Logger.info(`Starboard disabled for guild ${guild.id} due to channel fetch error.`);
        };
    })
}