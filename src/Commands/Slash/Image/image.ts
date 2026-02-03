import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder } from "discord.js";
let pet = require("./Subcommands/pet");
let deepfry = require("./Subcommands/Deepfry");
let caption = require("./Subcommands/Caption");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("image")
        .setDescription("All things image related")
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ])
        .setIntegrationTypes([
            ApplicationIntegrationType.GuildInstall,
            ApplicationIntegrationType.UserInstall
        ])
        
        .addSubcommand(pet.data)
        .addSubcommand(deepfry.data)
        .addSubcommand(caption.data)
        ,

    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        if(subcommand === "pet") await pet.execute(interaction);
        if(subcommand === "deepfry") await deepfry.execute(interaction);
        if(subcommand === "caption") await caption.execute(interaction);
    }
}