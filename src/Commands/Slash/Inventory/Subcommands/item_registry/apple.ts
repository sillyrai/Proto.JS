import { ChatInputCommandInteraction } from "discord.js";

module.exports = {
    async execute(interaction: ChatInputCommandInteraction, item: any, dbUser: any) {
        await interaction.reply({ content: `You ate the apple xd`, ephemeral: true });
    }
}