import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, PermissionFlagsBits, SectionBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Logger from "../../../Modules/Logger";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Unmutes a user in the server")
        .addUserOption(option => 
            option.setName("user")
                .setDescription("The user to unmute")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers), // No default permissions; requires specific role or permission to use

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const user = interaction.options.getUser("user", true);

        let member = await interaction.guild?.members.fetch(user.id);

        if (!member) {
            await interaction.followUp({
                content: "User not found in this server.",
            });
            return;
        }

        if(!member.moderatable){
            await interaction.followUp({
                content: "I cannot unmute this user. They may have higher permissions than me.",
            });
            return;
        }

        await member.timeout(null);

        Logger.info(`User ${user.tag} (${user.id}) was unmuted in the server ${interaction.guild?.name} by ${interaction.user.tag} (${interaction.user.id})`);
        let ResponseMessage = new ContainerBuilder();
        ResponseMessage.addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder()
                .setContent(`## :sound: Unmuted ${member.user.tag}!
**${member.user.tag}** has been unmuted.
-# Unmuted by @${interaction.user.tag} (${interaction.user.id})`))
            .setThumbnailAccessory(new ThumbnailBuilder()
                .setURL(member.displayAvatarURL() || '')));

        await interaction.followUp({
            components: [ResponseMessage],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}