import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ChannelType, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } from "discord.js";
import Database from "../../../../Modules/Database";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("emoji")
        .setDescription("⭐ Sets the starboard emoji")
        .addStringOption(option =>
            option.setName("emoji")
                .setDescription("The emoji to use for the starboard")
                .setRequired(true)),
                
    async execute(interaction: ChatInputCommandInteraction) {
        const emoji = interaction.options.getString("emoji", true);
        await interaction.deferReply()

        // Check if the emoji is valid (either a unicode emoji or a custom emoji)
        const emojiRegex = /^(<a?:\w+:\d+>|[\u2700-\u27BF]|[\u2600-\u26FF]|[\u2B00-\u2BFF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+$/;
        if (!emojiRegex.test(emoji)) {
            await interaction.editReply({ content: "Please provide a valid emoji." });
            return;
        }

        let dbGuild = await Database.getGuild(interaction.guildId!);
        dbGuild.starboard.emoji = emoji;
        await dbGuild.save();

        let Response = new ContainerBuilder()
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ⭐ Starboard updated!`));
        Response.addSeparatorComponents(new SeparatorBuilder())
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`The starboard emoji has been set to ${emoji}.`));

        if(dbGuild.starboard.enabled === false){
            Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`⚠️ Note: The starboard is currently disabled. Use \`/starboard enabled true\` to enable it.`));
        }

        await interaction.editReply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}