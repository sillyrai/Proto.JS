import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ChannelType, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } from "discord.js";
import Database from "../../../../Modules/Database";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("threshold")
        .setDescription("⭐ Sets the starboard channel threshold")
        .addIntegerOption(option =>
            option.setName("threshold")
                .setDescription("The number of reactions required to post to starboard")
                .setRequired(true)),
                
    async execute(interaction: ChatInputCommandInteraction) {
        const threshold = interaction.options.getInteger("threshold", true);
        await interaction.deferReply()

        let dbGuild = await Database.getGuild(interaction.guildId!);
        dbGuild.starboard.threshold = threshold;
        await dbGuild.save();

        let Response = new ContainerBuilder()
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ⭐ Starboard updated!`));
        Response.addSeparatorComponents(new SeparatorBuilder())
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`The starboard threshold has been set to ${threshold}.`));

        await interaction.editReply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}