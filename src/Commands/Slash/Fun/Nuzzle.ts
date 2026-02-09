import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder } from "discord.js";
import Database from "../../../Modules/Database";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nuzzle")
        .setDescription("🐾 Nuzzle someone affectionately.")
        .addUserOption(option =>
            option.setName("target")
                .setDescription("The user to nuzzle")
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
            "{caller} nuzzles {target} softly.",
            "{caller} gives {target} a warm nuzzle!",
            "{caller} rubs their cheek against {target}.",
            "{caller} scoots closer and nuzzles {target}.",
            "{caller} nuzzles {target} with a happy chirp!",
            "{caller} gives {target} a gentle little nuzzle.",
            "{caller} nestles in and nuzzles {target}.",
            "{caller} boops then nuzzles {target}.",
            "{caller} sneaks a quick nuzzle on {target}.",
            "{target} receives a sweet nuzzle from {caller}!"
        ];

        const caller = interaction.user;
        const target = interaction.options.getUser("target", true);
        let response = responses[Math.floor(Math.random() * responses.length)];

        if (target.id === interaction.client.user?.id) {
            response = "{caller} nuzzles me! *happy beeps*";
        }
        if (target.id === caller.id) {
            response = "{caller} nuzzles themselves. Cozy vibes.";
        }

        response = response.replace("{caller}", `<@${caller.id}>`).replace("{target}", `<@${target.id}>`);

        const NuzzleGifs: string[] = [
            "https://c.tenor.com/q_GaUwW9TP0AAAAd/tenor.gif",
            "https://c.tenor.com/fvzn0R8HloAAAAAd/tenor.gif",
            "https://c.tenor.com/roljJSXlwkIAAAAd/tenor.gif",
            "https://c.tenor.com/wFxMAqCsQDoAAAAd/tenor.gif",
            "https://c.tenor.com/LWYOG0Mi998AAAAd/tenor.gif",
            "https://c.tenor.com/FAY10R60110AAAAd/tenor.gif"
        ];
        const selectedGif = NuzzleGifs.length > 0 ? NuzzleGifs[Math.floor(Math.random() * NuzzleGifs.length)] : null;

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
        dbUser.counters.nuzzle += 1;
        dbUser.save();

        responseDisplay.addSeparatorComponents(new SeparatorBuilder());
        responseDisplay.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`-# ${target.username} has been nuzzled ${dbUser.counters.nuzzle} times!`)
        );

        await interaction.reply({
            components: [responseDisplay],
            flags: [MessageFlags.IsComponentsV2],
            allowedMentions: { parse: [] }
        });
    }
};
