import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ChannelType } from "discord.js";
import GuildSchema from "../../../../Schemas/GuildSchema";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("channel")
        .setDescription("Sets the starboard channel")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel to set as the starboard channel")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),
                
    async execute(interaction: ChatInputCommandInteraction) {
        const channel = interaction.options.getChannel("channel", true);
        await interaction.deferReply()

        // Entry possibly doesnt exist yet, create it
        let dbGuild = await GuildSchema.findOne({ guildId: interaction.guildId });
        if (!dbGuild) {
            dbGuild = new GuildSchema({ guildId: interaction.guildId });
        }

        dbGuild.starboard.channel = channel.id;

        await dbGuild.save();

        await interaction.editReply({ content: `Starboard channel set to ${channel}` });
    }
}