import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import TextParser from "../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("uwuify")
        .setDescription("UwUify your message.")
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

        /*
        Example sentence and output:
        "Hello there, how are you doing on this fine day?"
        =
        "H-hewwo thewe o//o, h-how awe chu dooin on dis fine day o3o"
        */

        let emoticons = ['(・`ω´・)', ';;w;;', 'owo', 'UwU', '>w<', '^w^', '(* ^ ω ^)', '(o^ ^o)', 'o(>ω<)o', '>///<', 'rawr x3', 'nyaa~', ':3', 'x3'];
        
        let uwuified = message
            .replace(/r/g, 'w')
            .replace(/l/g, 'w')
            .replace(/R/g, 'W')
            .replace(/L/g, 'W')
            .replace(/n([aeiou])/g, 'ny$1')
            .replace(/N([aeiou])/g, 'Ny$1')
            .replace(/N([AEIOU])/g, 'NY$1')
            .replace(/ove/g, 'uv')

        // add random stutters in word
        uwuified = uwuified.split(' ').map(word => {
            if (word.length > 2 && Math.random() < 0.2) { // 20% chance to stutter
                return word.charAt(0) + '-' + word;
            }
            return word;
        }).join(' ');

        // 25% chance for a random emoticon after each word
        uwuified = uwuified.split(' ').map(word => {
            if (Math.random() < 0.25) {
                return word + ' ' + emoticons[Math.floor(Math.random() * emoticons.length)];
            }
            return word;
        }).join(' ');

        await interaction.reply({
            content: uwuified,
            allowedMentions: { parse: [] }
        })
    }
}