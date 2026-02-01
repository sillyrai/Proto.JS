import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, PermissionFlagsBits, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import TextParser from "../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mutes a user in the server")
        .addUserOption(option => 
            option.setName("user")
                .setDescription("The user to mute")
                .setRequired(true))
        .addStringOption(option => 
            option.setName("duration")
                .setDescription("The duration of the mute (e.g., 10m, 1h, 1d, can also be things like \"3d5h\") max 28 days")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers), // No default permissions; requires specific role or permission to use

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const user = interaction.options.getUser("user", true);
        const durationInput = interaction.options.getString("duration", true);
        const parsedTime = TextParser.TimeStringParser(durationInput);

        if(!parsedTime) {
            await interaction.followUp({
                content: "Invalid duration format. Please use formats like 10m, 1h, 1d, or combinations like 3d5h.",
            });
            return;
        }

        const maxMuteDuration = 28 * 24 * 60 * 60 * 1000; // 28 days in milliseconds
        if(parsedTime > maxMuteDuration) {
            await interaction.followUp({
                content: "The maximum mute duration is 28 days.",
            });
            return;
        }
        if(parsedTime < 1000) {
            await interaction.followUp({
                content: "The minimum mute duration is 1 second.",
            });
            return;
        }

        let member = await interaction.guild?.members.fetch(user.id);

        if (!member) {
            await interaction.followUp({
                content: "User not found in this server.",
            });
            return;
        }

        if(!member.moderatable){
            await interaction.followUp({
                content: "I cannot mute this user. They may have higher permissions than me.",
            });
            return;
        }

        await member.timeout(parsedTime, `Muted by ${interaction.user.tag} for ${durationInput}`);

        let ResponseMessage = new ContainerBuilder();
        ResponseMessage.addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder()
                .setContent(`## :mute: Muted **${user.tag}**.`))
            .addTextDisplayComponents(new TextDisplayBuilder()
                .setContent(`**Duration**: \`${durationInput}\`\nThey will be unmuted <t:${Math.floor((Date.now() + parsedTime) / 1000)}:R>`))
            .addTextDisplayComponents(new TextDisplayBuilder()
                .setContent(`-# Muted by @${interaction.user.tag} (${interaction.user.id})`))
            .setThumbnailAccessory(new ThumbnailBuilder()
                .setURL(member.displayAvatarURL() || '')));

        await interaction.followUp({
            components: [ResponseMessage],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}