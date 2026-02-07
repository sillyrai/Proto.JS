import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import TextParser from "../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("uwuify")
        .setDescription("🦊 UwUify your message.")
        .addStringOption(option => 
            option.setName("message")
                .setDescription("The message to uwuify")
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


        let emoticons = ['OwO', 'UwU', '>w<', 'o3o', '^w^', 'o//o', 'rawr', 'nyaa', 'x3', '0w0', '>_<', '-w-', 'UwU', 'OwO'];
        const uwuified = message
            .replace(/l/g, 'w')
            .replace(/r/g, 'w')
            .replace(/L/g, 'W')
            .replace(/R/g, 'W')
            .replace(/n(?=[aeiou])/g, 'n')
            .replace(/N(?=[AEIOU])/g, 'N')
            .replace(/th/gi, 'de')
            .replace(/ou/g, 'ou')
            .split(' ')
            .map(word => {
            if (Math.random() > 0.5) word = word[0].toLowerCase() + '-' + word[0].toLowerCase() + word.slice(1);
            if (Math.random() > 0.7) word += ' ' + emoticons[Math.floor(Math.random() * emoticons.length)];
            return word;
            })
            .join(' ')
            + (Math.random() > 0.3 ? ' ' + emoticons[Math.floor(Math.random() * emoticons.length)] : '');

        await interaction.reply({
            content: uwuified,
            allowedMentions: { parse: [] }
        });

    }
}