import { ChatInputCommandInteraction } from "discord.js";

module.exports = {
    async execute(interaction: ChatInputCommandInteraction, item: any, dbUser: any) {
        await interaction.reply({ content: `The book revives ${interaction.user.username} from the dead!` });
    }
}