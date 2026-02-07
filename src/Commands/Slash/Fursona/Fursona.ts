import { ApplicationIntegrationType, ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
let add = require("./Subcommands/Add");
let remove = require("./Subcommands/Remove");
let view = require("./Subcommands/View");
let help = require("./Subcommands/Help");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fursona")
        .setDescription("💸 All things fursona/original character related")
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ])
        .setIntegrationTypes([
            ApplicationIntegrationType.GuildInstall,
            ApplicationIntegrationType.UserInstall
        ])
        .addSubcommand(add.data)
        .addSubcommand(remove.data)
        .addSubcommand(view.data)
        .addSubcommand(help.data),
        
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        if(subcommand === "add") await add.execute(interaction);
        else if(subcommand === "remove") await remove.execute(interaction);
        else if(subcommand === "view") await view.execute(interaction);
        else if(subcommand === "help") await help.execute(interaction);
    }
}
