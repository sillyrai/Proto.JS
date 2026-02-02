import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ChannelType, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } from "discord.js";
import Database from "../../../../Modules/Database";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("enabled")
        .setDescription("Enables or disables the starboard")
        .addBooleanOption(option =>
            option.setName("enabled")
                .setDescription("Enable or disable the starboard")
                .setRequired(true)),
                
    async execute(interaction: ChatInputCommandInteraction) {
        const enabled = interaction.options.getBoolean("enabled", true);
        await interaction.deferReply()

        let dbGuild = await Database.getGuild(interaction.guildId!);
        dbGuild.starboard.enabled = enabled;
        await dbGuild.save();

        let Response = new ContainerBuilder()
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ⭐ Starboard updated!`));
        Response.addSeparatorComponents(new SeparatorBuilder())
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`The starboard has been ${enabled ? "enabled" : "disabled"}.`));

        await interaction.editReply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}