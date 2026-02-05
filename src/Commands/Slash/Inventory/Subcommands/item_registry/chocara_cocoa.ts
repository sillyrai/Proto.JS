import { ChatInputCommandInteraction } from "discord.js";

module.exports = {
    async execute(interaction: ChatInputCommandInteraction, item: any, dbUser: any) {
        let username = interaction.user.username;
        let responses = [
            `${username} drinks the Hot Cocoa and feels warm and cozy!`,
            `${username} says, "Mmm, hot cocoa is pleasant!"`,
            `${username} thinks, "Tasty Hot Cocoa!"`,
            `${username} says, "Hot and sweet! Just how I like it!"`,
            `${username} says, "A cup of cocoa can make anyone's day better!"`,
            `${username} says, "A hot cup of sweetness!"`
        ]
        let response = responses[Math.floor(Math.random() * responses.length)];
        await interaction.reply({ content: `:coffee: ${response}` });
    }
}