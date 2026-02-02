import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ChannelType } from "discord.js";


module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("threshold")
        .setDescription("Sets the starboard reaction threshold")
        .addIntegerOption(option =>
            option.setName("threshold")
                .setDescription("The number of reactions required to post to starboard")
                .setRequired(true)),
                
    async execute(interaction: ChatInputCommandInteraction) {
        const threshold = interaction.options.getInteger("threshold", true);
        await interaction.editReply({ content: `Starboard threshold set to ${threshold}` });
    }
}