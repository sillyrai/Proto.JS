import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder } from "discord.js";
import Database from "../../../Modules/Database";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pat")
        .setDescription("🐾 Pat someone gently.")
        .addUserOption(option =>
            option.setName("target")
                .setDescription("The user to pat")
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
            "{caller} pats {target} gently.",
            "{caller} gives {target} a reassuring pat!",
            "{caller} reaches out and pats {target}.",
            "{caller} pats {target} on the head.",
            "{caller} gives {target} a couple of soft pats.",
            "{caller} pats {target} with a smile.",
            "{caller} delivers a comforting pat to {target}.",
            "{caller} pats {target} carefully.",
            "{caller} gives {target} a tiny pat of encouragement.",
            "{target} receives a kind pat from {caller}!"
        ];

        const caller = interaction.user;
        const target = interaction.options.getUser("target", true);
        let response = responses[Math.floor(Math.random() * responses.length)];

        if (target.id === interaction.client.user?.id) {
            response = "{caller} pats me! *content hum*";
        }
        if (target.id === caller.id) {
            response = "{caller} gives themselves a pat. Self-care!";
        }

        response = response.replace("{caller}", `<@${caller.id}>`).replace("{target}", `<@${target.id}>`);

        const PatGifs: string[] = [
            "https://c.tenor.com/-jJlxJOR2yIAAAAd/tenor.gif",
            "https://c.tenor.com/luKSDbafAKIAAAAd/tenor.gif",
            "https://c.tenor.com/_NRJIzd6gN0AAAAd/tenor.gif",
            "https://c.tenor.com/8kvNhB9VejwAAAAd/tenor.gif",
            "https://c.tenor.com/Ie_WGvZItxkAAAAd/tenor.gif",
            "https://c.tenor.com/P1RUJ6n4sekAAAAd/tenor.gif",
            "https://c.tenor.com/wc_CL05jQRwAAAAd/tenor.gif",
            "https://c.tenor.com/zxbqQutapukAAAAd/tenor.gif"
        ];
        const selectedGif = PatGifs.length > 0 ? PatGifs[Math.floor(Math.random() * PatGifs.length)] : null;

        const responseDisplay = new ContainerBuilder();
        responseDisplay.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`### 🐾 ${response}`)
        );

        if (selectedGif) {
            responseDisplay.addSeparatorComponents(new SeparatorBuilder());
            responseDisplay.addMediaGalleryComponents(new MediaGalleryBuilder()
                .addItems(new MediaGalleryItemBuilder().setURL(selectedGif))
            );
        }

        let dbUser = await Database.getUser(target.id);
        dbUser.counters.pat += 1;
        dbUser.save();

        responseDisplay.addSeparatorComponents(new SeparatorBuilder());
        responseDisplay.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`-# ${target.username} has been patted ${dbUser.counters.pat} times!`)
        );

        await interaction.reply({
            components: [responseDisplay],
            flags: [MessageFlags.IsComponentsV2],
            allowedMentions: { parse: [] }
        });
    }
};
