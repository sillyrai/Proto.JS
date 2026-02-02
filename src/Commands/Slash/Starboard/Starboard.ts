import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
let channel = require("./Subcommands/Channel");
let threshold = require("./Subcommands/Threshold");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("starboard")
        .setDescription("All things starboard related")
        .addSubcommand(channel.data)
        .addSubcommand(threshold.data)
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
        }
    }
}
