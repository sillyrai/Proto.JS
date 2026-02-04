import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ChannelType, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } from "discord.js";
import Database from "../../../../Modules/Database";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("message")
        .setDescription("👋 Sets the join/leave message")
        .addStringOption(option =>
            option.setName("type")
                .setDescription("The type of message to set (join or leave)")
                .setRequired(true)
            .addChoices([
                {name: "join", value: "join"}, 
                {name: "leave", value: "leave"}
            ]))
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The welcome message to set")
                .setRequired(true)),
                
    async execute(interaction: ChatInputCommandInteraction) {
        const type = interaction.options.getString("type", true);
        const message = interaction.options.getString("message", true);

        await interaction.deferReply()

        let dbGuild = await Database.getGuild(interaction.guildId!);
        if (type === "join") {
            dbGuild.welcomer.joinMessage = message;
        } else if (type === "leave") {
            dbGuild.welcomer.leaveMessage = message;
        }
        await dbGuild.save();

        let Response = new ContainerBuilder()
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 🎉 Welcomer message updated!`));
        Response.addSeparatorComponents(new SeparatorBuilder())
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`The ${type} message has been updated.`));
        
        await interaction.editReply({ 
            components: [Response], 
            flags: [MessageFlags.IsComponentsV2] 
        });
    }
}