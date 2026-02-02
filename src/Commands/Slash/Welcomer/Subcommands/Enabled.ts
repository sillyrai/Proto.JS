import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ChannelType, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } from "discord.js";
import Database from "../../../../Modules/Database";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("enabled")
        .setDescription("Enables or disables the welcomer feature")
        .addBooleanOption(option =>
            option.setName("enabled")
                .setDescription("Enable or disable the welcomer")
                .setRequired(true)),
                
    async execute(interaction: ChatInputCommandInteraction) {
        const enabled = interaction.options.getBoolean("enabled", true);

        await interaction.deferReply()

        let dbGuild = await Database.getGuild(interaction.guildId!);
        dbGuild.welcomer.enabled = enabled;
        await dbGuild.save();

        let Response = new ContainerBuilder()
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 🎉 Welcomer updated!`));
        Response.addSeparatorComponents(new SeparatorBuilder())
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`The welcomer has been ${enabled ? "enabled" : "disabled"}.`));
        
        await interaction.editReply({ 
            components: [Response], 
            flags: [MessageFlags.IsComponentsV2] 
        });
    }
}