import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ChannelType, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } from "discord.js";
import Database from "../../../../Modules/Database";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("channel")
        .setDescription("Sets the welcomer channel")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel to set for the welcomer")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),
                
    async execute(interaction: ChatInputCommandInteraction) {
        const channel = interaction.options.getChannel("channel", true);
        await interaction.deferReply()

        let dbGuild = await Database.getGuild(interaction.guildId!);
        dbGuild.welcomer.channel = channel.id;
        await dbGuild.save();

        let Response = new ContainerBuilder()
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 🎉 Welcomer updated!`));
        Response.addSeparatorComponents(new SeparatorBuilder())
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`The welcomer channel has been updated.`));
        
        await interaction.editReply({ 
            components: [Response], 
            flags: [MessageFlags.IsComponentsV2] 
        });
    }
}