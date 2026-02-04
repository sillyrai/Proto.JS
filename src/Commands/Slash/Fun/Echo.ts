import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import TextParser from "../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("🔁 Echo your message.")
        .addStringOption(option => 
            option.setName("message")
                .setDescription("The message to echo")
                .setRequired(true))
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
        let message = interaction.options.getString("message", true);

        await interaction.reply({ 
            content: message,
            allowedMentions: { parse: [] }
        });
    }
}