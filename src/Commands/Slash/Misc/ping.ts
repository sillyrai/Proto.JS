import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),

    async execute(interaction: ChatInputCommandInteraction) {
        let latency = Date.now() - interaction.createdTimestamp;
        await interaction.reply(`Pong! Latency is ${latency}ms.`);
    }
}