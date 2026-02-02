import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import TextParser from "../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("hug")
        .setDescription("Give someone a hug!")
        .addUserOption(option => 
            option.setName("target")
                .setDescription("The user to hug")
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
        const responses = [
            "{caller} gives {target} a warm hug!",
            "{caller} wraps their arms around {target} in a big hug!",
            "{caller} hugs {target} tightly!",
            "{caller} gives {target} a friendly squeeze!",
            "{caller} pulls {target} into a comforting hug!",
            "{caller} shares a heartfelt hug with {target}!",
            "{caller} runs over and hugs {target}!",
            "{caller} tackles {target} with a bear hug!",
            "{caller} embraces {target} gently.",
            "{caller} gives {target} a quick but firm hug.",
            "{caller} engulfs {target} in a massive hug!",
            "{caller} sneaks up and hugs {target} from behind!",
            "{caller} delivers a super effective hug to {target}!",
            "{caller} thinks {target} needs a hug, so here it is!",
            "{target} receives a surprise hug from {caller}!",
            "A wild {caller} appears and hugs {target}!"
        ]

        const caller = interaction.user;
        const target = interaction.options.getUser("target", true);
        let response = responses[Math.abs((caller.id.length + target.id.length) % responses.length)];

        // Easter egg
        if(target.id === interaction.client.user?.id) {
            response = "{caller} hugs me! *blushes* ʕ•́ᴥ•̀ʔっ";
        }

        response = response.replace("{caller}", `<@${caller.id}>`).replace("{target}", `<@${target.id}>`);

        const Response = new ContainerBuilder()
        Response.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`:people_hugging: ${response}`)
        );
        
        await interaction.reply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2],
            allowedMentions: { parse: [] }
        });
    }
}