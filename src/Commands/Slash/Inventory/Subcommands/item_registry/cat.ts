import { ChatInputCommandInteraction } from "discord.js";

module.exports = {
    async execute(interaction: ChatInputCommandInteraction, item: any, dbUser: any) {
        let catSounds = [
            "meeow! mrrp! :3",
            "mraaow! purr! :3",
            "mew! mrrp! :3",
            "meow! purr! :3",
            "mraow! mrrp! :3",
            "mrraaooowww :3"
        ]
        let sound = catSounds[Math.floor(Math.random() * catSounds.length)];
        await interaction.reply({ content: `:cat: ${sound}` });
    }
}