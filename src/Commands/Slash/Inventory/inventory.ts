import { ApplicationIntegrationType, ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
let item = require("./Subcommands/Item")
let view = require("./Subcommands/View")
let give = require("./Subcommands/Give")
module.exports = {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("🎒 Extension to the economy system for managing your inventory")
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
        .addSubcommand(view.data)
        .addSubcommand(give.data),

    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        if(subcommand === "item") await item.execute(interaction);
        if(subcommand === "view") await view.execute(interaction);
        if(subcommand === "give") await give.execute(interaction);
    }
}
