import { ApplicationIntegrationType, ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
let balance = require("./Subcommands/Balance");
let work = require("./Subcommands/Work");
let daily = require("./Subcommands/Daily");
let weekly = require("./Subcommands/Weekly");
let pay = require("./Subcommands/Pay");
let coinflip = require("./Subcommands/CoinFlip");
let blackjack = require("./Subcommands/Blackjack");
let leaderboard = require("./Subcommands/Leaderboard");
let shop = require("./Subcommands/Shop");
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
        .addSubcommand(pay.data)
        .addSubcommand(coinflip.data)
        .addSubcommand(blackjack.data)
        .addSubcommand(leaderboard.data)
        .addSubcommand(shop.data),
        
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        if(subcommand === "balance") await balance.execute(interaction);
        else if(subcommand === "work") await work.execute(interaction);
        else if(subcommand === "daily") await daily.execute(interaction);
        else if(subcommand === "weekly") await weekly.execute(interaction);
        else if(subcommand === "pay") await pay.execute(interaction);
        else if(subcommand === "coinflip") await coinflip.execute(interaction);
        else if(subcommand === "blackjack") await blackjack.execute(interaction);
        else if(subcommand === "leaderboard") await leaderboard.execute(interaction);
        else if(subcommand === "shop") await shop.execute(interaction);
    }
}
