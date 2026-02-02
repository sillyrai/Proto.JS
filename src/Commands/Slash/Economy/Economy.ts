import { ApplicationIntegrationType, ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
let balance = require("./Subcommands/Balance");
let work = require("./Subcommands/Work");
let daily = require("./Subcommands/Daily");
let weekly = require("./Subcommands/Weekly");
let pay = require("./Subcommands/Pay");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("economy")
        .setDescription("All things economy related")
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ])
        .setIntegrationTypes([
            ApplicationIntegrationType.GuildInstall,
            ApplicationIntegrationType.UserInstall
        ])
        .addSubcommand(balance.data)
        .addSubcommand(work.data)
        .addSubcommand(daily.data)
        .addSubcommand(weekly.data)
        .addSubcommand(pay.data),

    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "balance":
                await balance.execute(interaction);
                break;
            case "work":
                await work.execute(interaction);
                break;
            case "daily":
                await daily.execute(interaction);
                break;
            case "weekly":
                await weekly.execute(interaction);
                break;
            case "pay":
                await pay.execute(interaction);
                break;
        }
    }
}
