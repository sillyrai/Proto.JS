import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import TextParser from "../../../Modules/TextParser";
import config from "../../../config.json" assert { type: "json" };
module.exports = {
    data: new SlashCommandBuilder()
        .setName("guildstats")
        .setDescription("🔍 Information about the current guild!"),

    async execute(interaction: ChatInputCommandInteraction) {
        let Response = new ContainerBuilder();
        Response.addSectionComponents(new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 🏰 Guild Information
**Name:** ${interaction.guild?.name}
**ID:** ${interaction.guild?.id}
**Owner:** <@${interaction.guild?.ownerId}>
**Members:** ${interaction.guild?.memberCount}
**Boosts:** ${interaction.guild?.premiumSubscriptionCount || 0}
**Created At:** <t:${Math.floor((interaction.guild?.createdTimestamp || 0) / 1000)}:R>
`))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(interaction.guild?.iconURL({ size: 256 }) || "")));
        Response.addSeparatorComponents(new SeparatorBuilder());
        let RolesAsString = interaction.guild?.roles.cache
            .filter(role => role.id !== interaction.guild?.id)
            .sort((a, b) => b.position - a.position)
            .map(role => `<@&${role.id}>`)
            .join(", ") || "None";
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Roles**: ${RolesAsString}`));

        await interaction.reply({ 
            components: [Response], 
            flags: [MessageFlags.IsComponentsV2],
            allowedMentions: { parse: [] } 
        });
    }
}