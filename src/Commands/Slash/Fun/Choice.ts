import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import TextParser from "../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("choice")
        .setDescription("🎲 Make a choice from your options.")
        .addStringOption(option => 
            option.setName("options")
                .setDescription("The options to choose from, separated by commas")
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
        let options = interaction.options.getString("options", true);
        let choices = options.split(",").map(choice => choice.trim());
        let choice = choices[Math.floor(Math.random() * choices.length)];

        await interaction.reply({ 
            content:  `I choose: **${choice}**`,
            allowedMentions: { parse: [] }
        });
    }
}