import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, DefaultWebSocketManagerOptions, InteractionContextType, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Database from "../../../Modules/Database";
module.exports = {
    data: new SlashCommandBuilder()
        .setName("boop")
        .setDescription("🐾 Boop a person >:3.")
        .addUserOption(option => 
            option.setName("user")
                .setDescription("The user to boop")
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
            "{caller} boops {target}!",
            "{caller} gently boops {target}'s nose.",
            "{caller} sneaks up and boops {target}!",
            "{caller} gives {target} a tactical boop!",
            "{caller} pokes {target} with a boop!",
            "Boop! {caller} got {target}!",
            "{caller} reaches out and boops {target}.",
            "{caller} delivers a mega boop to {target}!",
            "{caller} applies a boop to {target}'s face.",
            "{target} has been booped by {caller}!"
        ];

        const caller = interaction.user;
        const target = interaction.options.getUser("user", true);
        let response = responses[Math.floor(Math.random() * responses.length)];

        // Easter egg
        if(target.id === interaction.client.user?.id) {
            response = "{caller} boops me! *beep boop* 🤖";
        }
        if(target.id === caller.id) {
            response = "{caller} boops themselves in the mirror. Looking good!";
        }

        response = response.replace("{caller}", `<@${caller.id}>`).replace("{target}", `<@${target.id}>`);

        const BoopGifs = [
            "https://c.tenor.com/nVXthyy_ReQAAAAd/tenor.gif",
            "https://c.tenor.com/eOoQ_YB2IF8AAAAd/tenor.gif",
            "https://c.tenor.com/n997o-na714AAAAd/tenor.gif",
            "https://c.tenor.com/WM6gQWWPvIcAAAAd/tenor.gif",
            "https://c.tenor.com/69LVEecRI4oAAAAd/tenor.gif"
        ]
        const selectedGif = BoopGifs[Math.floor(Math.random() * BoopGifs.length)];

        const BoopDisplay = new ContainerBuilder();

        BoopDisplay.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`### 🐾 ${response}`)
        );
        BoopDisplay.addSeparatorComponents(new SeparatorBuilder());
        BoopDisplay.addMediaGalleryComponents(new MediaGalleryBuilder()
            .addItems(new MediaGalleryItemBuilder().setURL(selectedGif))
        );

        let dbUser = await Database.getUser(target.id);
        dbUser.counters.boop += 1;
        dbUser.save();

        BoopDisplay.addSeparatorComponents(new SeparatorBuilder());
        BoopDisplay.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`-# ${target.username} has been booped ${dbUser.counters.boop} times!`)
        );

        
        await interaction.reply({ 
            components: [BoopDisplay],
            flags: [MessageFlags.IsComponentsV2],
            allowedMentions: { parse: [] }
        });
    }
}