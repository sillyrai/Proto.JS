import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, EmbedBuilder, InteractionContextType, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("🛠️ Create a custom embed message.")
        .addStringOption(option =>
            option.setName("title")
                .setDescription("The title of the embed")
                .setRequired(false))
        .addStringOption(option =>
            option.setName("description")
                .setDescription("The description of the embed, to do a new line, use \\n")
                .setRequired(false))
        .addStringOption(option =>
            option.setName("image")
                .setDescription("URL of the image to include in the embed")
                .setRequired(false))
        .addStringOption(option =>
            option.setName("thumbnail")
                .setDescription("URL of the thumbnail to include in the embed")
                .setRequired(false))
        .addStringOption(option =>
            option.setName("footer")
                .setDescription("Footer text of the embed")
                .setRequired(false))
        .addStringOption(option =>
            option.setName("color")
                .setDescription("Hex color code for the embed (e.g., #FF5733)")
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName("include_timestamp")
                .setDescription("Whether to include a timestamp in the embed")
                .setRequired(false))
        .addStringOption(option =>
            option.setName("author_name")
                .setDescription("Name of the author to display in the embed")
                .setRequired(false))
        .addStringOption(option =>
            option.setName("author_icon")
                .setDescription("URL of the author icon to display in the embed")
                .setRequired(false))
        
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ])
        .setIntegrationTypes([
            ApplicationIntegrationType.GuildInstall,
            ApplicationIntegrationType.UserInstall
        ]),

    async execute(interaction: ChatInputCommandInteraction) {
        let title = interaction.options.getString("title") || undefined;
        let description = interaction.options.getString("description") || undefined;
        let image = interaction.options.getString("image") || undefined;
        let thumbnail = interaction.options.getString("thumbnail") || undefined;
        let footer = interaction.options.getString("footer") || undefined;
        let color = interaction.options.getString("color") || undefined;
        let includeTimestamp = interaction.options.getBoolean("include_timestamp") || false;
        let authorName = interaction.options.getString("author_name") || undefined;
        let authorIcon = interaction.options.getString("author_icon") || undefined;

        let Embed = new EmbedBuilder()
        if(title) Embed.setTitle(title);
        if(description) Embed.setDescription(description.replace(/\\n/g, '\n'));
        if(image) Embed.setImage(image);
        if(thumbnail) Embed.setThumbnail(thumbnail);
        if(footer) Embed.setFooter({ text: footer });
        if(color) Embed.setColor(color as `#${string}`);
        if(includeTimestamp) Embed.setTimestamp();
        if(authorName) Embed.setAuthor({ name: authorName, iconURL: authorIcon || undefined });


        await interaction.reply({ 
            embeds: [Embed],
            allowedMentions: { parse: [] }
        });
    }
}