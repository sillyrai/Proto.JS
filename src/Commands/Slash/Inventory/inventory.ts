import { ApplicationIntegrationType, ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
let item = require("./Subcommands/Item")
let view = require("./Subcommands/view")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("Extension to the economy system for managing your inventory")
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ])
        .setIntegrationTypes([
            ApplicationIntegrationType.GuildInstall,
            ApplicationIntegrationType.UserInstall
        ])
        .addSubcommand(item.data)
        .addSubcommand(view.data),

    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        if(subcommand === "item") await item.execute(interaction);
        if(subcommand === "view") await view.execute(interaction);
    }
}
