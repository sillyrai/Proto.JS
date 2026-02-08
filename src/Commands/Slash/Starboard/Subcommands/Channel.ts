import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ChannelType, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } from "discord.js";
import Database from "../../../../Modules/Database";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("channel")
        .setDescription("⭐ Sets the starboard channel")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel to set as the starboard channel")
                .addChannelTypes(ChannelType.GuildText)
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
        
        if(dbGuild.starboard.enabled === false){
            Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`⚠️ Note: The starboard is currently disabled. Use \`/starboard enabled true\` to enable it.`));
        }

        await interaction.editReply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}