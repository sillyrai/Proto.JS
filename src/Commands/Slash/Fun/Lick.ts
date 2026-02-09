import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder } from "discord.js";
import Database from "../../../Modules/Database";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lick")
        .setDescription("😼 Lick someone (in a silly way).")
        .addUserOption(option =>
            option.setName("target")
                .setDescription("The user to lick")
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
            "{caller} gives {target} a playful lick!",
            "{caller} licks {target} and scampers away.",
            "{caller} delivers a quick lick to {target}.",
            "{caller} licks {target} like a goofball.",
            "{caller} sneaks a lick on {target}.",
            "{caller} gives {target} a cheeky lick!",
            "{caller} offers {target} a silly lick.",
            "{caller} licks {target} and looks proud.",
            "{caller} gives {target} an affectionate lick.",
            "{target} gets a surprise lick from {caller}!"
        ];

        const caller = interaction.user;
        const target = interaction.options.getUser("target", true);
        let response = responses[Math.floor(Math.random() * responses.length)];

        if (target.id === interaction.client.user?.id) {
            response = "{caller} licks me! *confused beep*";
        }
        if (target.id === caller.id) {
            response = "{caller} licks themselves. Interesting choice.";
        }

        response = response.replace("{caller}", `<@${caller.id}>`).replace("{target}", `<@${target.id}>`);

        const LickGifs: string[] = [
            "https://c.tenor.com/SW_VmrncNb0AAAAd/tenor.gif",
            "https://c.tenor.com/wNfnH4YfWUkAAAAd/tenor.gif",
            "https://c.tenor.com/SXYC8_SsQ4QAAAAd/tenor.gif",
            "https://c.tenor.com/x8g44L6gv7wAAAAd/tenor.gif",
            "https://c.tenor.com/2Tl8EashOGwAAAAd/tenor.gif",
            "https://c.tenor.com/haNCjO54-mkAAAAd/tenor.gif",
            "https://c.tenor.com/QfJO2Ioz8xkAAAAd/tenor.gif"
        ];
        const selectedGif = LickGifs.length > 0 ? LickGifs[Math.floor(Math.random() * LickGifs.length)] : null;

        const responseDisplay = new ContainerBuilder();
        responseDisplay.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`### 😼 ${response}`)
        );

        if (selectedGif) {
            responseDisplay.addSeparatorComponents(new SeparatorBuilder());
            responseDisplay.addMediaGalleryComponents(new MediaGalleryBuilder()
                .addItems(new MediaGalleryItemBuilder().setURL(selectedGif))
            );
        }

        let dbUser = await Database.getUser(target.id);
        dbUser.counters.lick += 1;
        dbUser.save();

        responseDisplay.addSeparatorComponents(new SeparatorBuilder());
        responseDisplay.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`-# ${target.username} has been licked ${dbUser.counters.lick} times!`)
        );

        await interaction.reply({
            components: [responseDisplay],
            flags: [MessageFlags.IsComponentsV2],
            allowedMentions: { parse: [] }
        });
    }
};
