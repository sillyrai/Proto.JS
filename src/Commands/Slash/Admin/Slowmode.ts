import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, PermissionFlagsBits, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextChannel, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Logger from "../../../Modules/Logger";
import TextParser from "../../../Modules/TextParser";
module.exports = {
    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("Sets slowmode for the current channel")
        .addStringOption(option => 
            option.setName("duration")
                .setDescription("The slowmode duration (e.g., 5s, 10m, 1h), max 6 hours")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const durationStr = interaction.options.getString("duration", true);
        const durationMatch = TextParser.TimeStringParser(durationStr);

        if (durationMatch === null) {
            await interaction.editReply({
                content: "Invalid duration format. Please use formats like 5s, 10m, or 1h.",
            });
            return;
        }

        const durationMs = durationMatch;
        if (durationMs < 0 || durationMs > 21600000) { // 6 hours in milliseconds
            await interaction.editReply({
                content: "Duration must be between 0 seconds and 6 hours.",
            });
            return;
        }

        try {
            let channel = interaction.channel as TextChannel;
            await channel.setRateLimitPerUser(durationMs / 1000, `Slowmode set by ${interaction.user.tag} (${interaction.user.id})`);
            await interaction.editReply({
                content: `Slowmode has been set to ${durationStr}.`,
            });
        }
        catch (error) {
            await interaction.editReply({
                content: "An error occurred while setting slowmode. Do I have the necessary permissions?",
            });
            Logger.error(`Slowmode command error: ${error}`);
        }
    }
}