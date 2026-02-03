import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ChannelType, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags, SectionBuilder, ThumbnailBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, TextChannel } from "discord.js";
import Database from "../../../../Modules/Database";
import {PostToStarboard} from "../../../../Handlers/StarboardHandler";
module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("force")
        .setDescription("Force a message to be posted to the starboard, bypassing the threshold requirement")
        .addStringOption(option =>
            option.setName("message_id")
                .setDescription("The ID of the message to force to starboard")
                .setRequired(true)),
                
    async execute(interaction: ChatInputCommandInteraction) {
        let messageId = interaction.options.getString("message_id", true);

        let message = await interaction.channel?.messages.fetch(messageId).catch(() => null);
        if(!message) {
            await interaction.reply({ content: "❌ Could not find a message with that ID in this channel.", ephemeral: true });
            return;
        }

        let dbGuild = await Database.getGuild(interaction.guild!.id);
    
        // Check if guild.starboard.posted already has this message ID
        if(dbGuild.starboard.posted.includes(message.id)) {
            await interaction.reply({ content: ":warning: This message has already been posted to the starboard. Forcing repost...", ephemeral: true });
        }
        // Add message ID to guild.starboard.posted and save
        dbGuild.starboard.posted.push(message.id);
        await dbGuild.save();
    
        // Create the starboard embed/message
        let Container = new ContainerBuilder();
        Container.addSectionComponents(new SectionBuilder()
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(message.author?.displayAvatarURL() || ''))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${dbGuild.starboard.emoji} Starboard\n## Post by **${message.author}**`))
        );
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
                    MediaText += `\n[${attachment.name}](${attachment.url})`;
                }
        if(MediaGallery.items.length > 0)
            Container.addMediaGalleryComponents(MediaGallery);
        if(MediaText.length > 0)
            Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(MediaText));
    
        let ButtonRow = new ActionRowBuilder<ButtonBuilder>()
        ButtonRow.addComponents(
            new ButtonBuilder()
                .setLabel('View Original Message')
                .setStyle(ButtonStyle.Link)
                .setURL(message.url)
        );
    
        let starboardChannel = interaction.guild?.channels.cache.get(dbGuild.starboard?.channel!) as TextChannel;
        if(!starboardChannel) {
            await interaction.reply({ content: "❌ Starboard channel not found. Please check the starboard configuration.", ephemeral: true });
            return;
        }
        
        // Send the starboard message
        await starboardChannel.send({ 
            components: [Container, ButtonRow],
            flags: [MessageFlags.IsComponentsV2]
        });

        await interaction.reply({ content: "✅ Message has been forced to the starboard." });
    }
}