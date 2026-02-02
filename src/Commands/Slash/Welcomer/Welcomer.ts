import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

let enabled = require("./Subcommands/enabled");
let message = require("./Subcommands/Message");
let channel = require("./Subcommands/Channel");
let help = require("./Subcommands/Help");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("welcomer")
        .setDescription("All things welcomer related")
        .addSubcommand(enabled.data)
        .addSubcommand(message.data)
        .addSubcommand(channel.data)
        .addSubcommand(help.data)

        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "enabled":
                await enabled.execute(interaction);
                break;
            case "message":
                await message.execute(interaction);
                break;
            case "channel":
                await channel.execute(interaction);
                break;
            case "help":
                await help.execute(interaction);
                break;
        }
    }
}
