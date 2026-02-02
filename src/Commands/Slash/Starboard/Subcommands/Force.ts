import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ChannelType, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } from "discord.js";
import Database from "../../../../Modules/Database";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("force")
        .setDescription("Force a message to be posted to the starboard, bypassing the threshold requirement")
        .addStringOption(option =>
            option.setName("message_id")
                .setDescription("The ID of the message to force to starboard")
                .setRequired(true)),
                
    async execute(interaction: ChatInputCommandInteraction) {
        const channel = interaction.options.getChannel("channel", true);
        await interaction.deferReply()

        let dbGuild = await Database.getGuild(interaction.guildId!);
        dbGuild.starboard.channel = channel.id;
        await dbGuild.save();

        let Response = new ContainerBuilder()
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ⭐ Starboard updated!`));
        Response.addSeparatorComponents(new SeparatorBuilder())
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`The starboard channel has been set to ${channel}.`));

        await interaction.editReply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}