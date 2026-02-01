import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, PermissionFlagsBits, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Logger from "../../../Modules/Logger";
module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kicks a user from the server")
        .addUserOption(option => 
            option.setName("user")
                .setDescription("The user to kick")
                .setRequired(true))
        .addStringOption(option => 
            option.setName("reason")
                .setDescription("The reason for kicking the user")
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const user = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason") || "No reason provided";
        const member = await interaction.guild?.members.fetch(user.id);

        if (!member) {
            await interaction.followUp({
                content: "User not found in this server.",
            })
            return;
        }

        if (!member.kickable) {
            await interaction.followUp({
                content: "I cannot kick this user. They may have higher permissions than me.",
            })
            return;
        }

        // Attempt to message the user before kicking
        let couldDm = true;
        try {
            let KickMessage = new ContainerBuilder()
            KickMessage.addSectionComponents(new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder()
                    .setContent(`## :tools: Kick notice!
You have been kicked from **${interaction.guild?.name}**.
**Reason**:
\`\`\`
${reason}
\`\`\`
-# Kicked by @${interaction.user.tag} (${interaction.user.id})`))
                .setThumbnailAccessory(new ThumbnailBuilder()
                    .setURL(interaction.guild?.iconURL() || '')))
            await user.send({
                components: [KickMessage],
                flags: [MessageFlags.IsComponentsV2]
            });
        }
        catch{
            couldDm = false;
        }

        await member.kick(`Kicked by ${interaction.user.tag} | Reason: ${reason}`);
        
        Logger.info(`User ${user.tag} (${user.id}) was kicked from the server ${interaction.guild?.name} by ${interaction.user.tag} (${interaction.user.id}) | Reason: ${reason}`);
        let ResponseMessage = new ContainerBuilder();
        ResponseMessage.addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder()
                .setContent(`## :tools: Kicked **${user.tag}**.`))
            .addTextDisplayComponents(new TextDisplayBuilder()
                .setContent(`**Reason**:\`\`\`\n${reason}\`\`\``))
            .addTextDisplayComponents(new TextDisplayBuilder()
                .setContent(couldDm ? "The user was notified via DM." : "Could not send DM to the user."))
            .setThumbnailAccessory(new ThumbnailBuilder()
                .setURL(interaction.user.displayAvatarURL() || '')));
        
        await interaction.followUp({
            components: [ResponseMessage],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}