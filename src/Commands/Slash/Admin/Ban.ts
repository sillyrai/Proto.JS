import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, PermissionFlagsBits, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Logger from "../../../Modules/Logger";
module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("⚒️ Bans a user from the server")
        .addUserOption(option => 
            option.setName("user")
                .setDescription("The user to ban")
                .setRequired(true))
        .addStringOption(option => 
            option.setName("reason")
                .setDescription("The reason for banning the user")
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const user = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason") || "No reason provided";
        const member = await interaction.guild?.members.fetch(user.id);

        if (!member) {
            await interaction.editReply({
                content: "User not found in this server.",
            })
            return;
        }

        if (!member.bannable) {
            await interaction.editReply({
                content: "I cannot ban this user. They may have higher permissions than me.",
            })
            return;
        }

        // Attempt to message the user before banning
        let couldDm = true;
        try {
            let BanMessage = new ContainerBuilder()
            BanMessage.addSectionComponents(new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder()
                    .setContent(`## :tools: Ban notice!
You have been banned from **${interaction.guild?.name}**.
**Reason**:
\`\`\`
${reason}
\`\`\`
-# Banned by @${interaction.user.tag} (${interaction.user.id})`))
                .setThumbnailAccessory(new ThumbnailBuilder()
                    .setURL(interaction.guild?.iconURL() || '')))
            await user.send({
                components: [BanMessage],
                flags: [MessageFlags.IsComponentsV2]
            });
        }
        catch (err){
            couldDm = false;
            Logger.error(`Failed to send ban DM to user ${user.tag} (${user.id}): ${err}`);
        }

        //await member.ban({
        //    reason: `Banned by ${interaction.user.tag} | Reason: ${reason}`,
        //});
        
        Logger.info(`User ${user.tag} (${user.id}) was banned from the server ${interaction.guild?.name} by ${interaction.user.tag} (${interaction.user.id}) | Reason: ${reason}`);
        let ResponseMessage = new ContainerBuilder();
        ResponseMessage.addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder()
                .setContent(`## :tools: Banned **${user.tag}**.`))
            .addTextDisplayComponents(new TextDisplayBuilder()
                .setContent(`**Reason**:\`\`\`\n${reason}\`\`\``))
            .addTextDisplayComponents(new TextDisplayBuilder()
                .setContent(couldDm ? "The user was notified via DM." : "Could not send DM to the user."))
            .setThumbnailAccessory(new ThumbnailBuilder()
                .setURL(member.displayAvatarURL() || '')));
        
        await interaction.editReply({
            components: [ResponseMessage],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}