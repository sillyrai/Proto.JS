import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

let channel = require("./Subcommands/Channel");
let threshold = require("./Subcommands/Threshold");
let enabled = require("./Subcommands/Enabled");
let emoji = require("./Subcommands/emoji");
let help = require("./Subcommands/Help");
let force = require("./Subcommands/Force");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("starboard")
        .setDescription("All things starboard related")
        .addSubcommand(channel.data)
        .addSubcommand(threshold.data)
        .addSubcommand(enabled.data)
        .addSubcommand(emoji.data)
        .addSubcommand(help.data)
        .addSubcommand(force.data)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "channel":
                await channel.execute(interaction);
                break;
            case "threshold":
                await threshold.execute(interaction);
                break;
            case "enabled":
                await enabled.execute(interaction);
                break;
            case "emoji":
                await emoji.execute(interaction);
                break;
            case "help":
                await help.execute(interaction);
                break;
            case "force":
                await force.execute(interaction);
                break;
        }
    }
}
