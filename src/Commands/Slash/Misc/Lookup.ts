import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lookup")
        .setDescription("Lookup a user for their profile information")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to lookup")
                .setRequired(false))
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ])
        .setIntegrationTypes([
            ApplicationIntegrationType.GuildInstall,
            ApplicationIntegrationType.UserInstall
        ]),

    async execute(interaction: ChatInputCommandInteraction) {
        const userVar = interaction.options.getUser("user") || interaction.user;
        const user = await interaction.client.users.fetch(userVar.id, {force: true});

        let Response = new ContainerBuilder();
        Response.addSectionComponents(new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 🔍 User Lookup
**Username:** ${user.tag}
**ID:** ${user.id}`))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(user.displayAvatarURL({ size: 256 }))));

        Response.addSeparatorComponents(new SeparatorBuilder());
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## :slight_smile: Global Information
**Account Created:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>
**Bot:** ${user.bot ? "Yes" : "No"}
**Accent Color:** ${user.accentColor ? `#${user.accentColor.toString(16).padStart(6, '0')}` : "None"}
**Profile Picture:** [Link](${user.displayAvatarURL({ size: 2048 })})`));

        // If this is in a guild, add guild-specific info
        if(interaction.guild) {
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            if(member){
                Response.addSeparatorComponents(new SeparatorBuilder());
                Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 🏰 Guild Specific Information
**Nickname:** ${member.nickname || "None"}
**Joined At:** <t:${Math.floor((member.joinedTimestamp || 0) / 1000)}:R>
**Roles:** ${member.roles.cache.size > 1 ? member.roles.cache.filter(role => role.id !== interaction.guild!.id).map(role => `<@&${role.id}>`).join(", ") : "None"}
**Highest Role:** ${member.roles.highest.id !== interaction.guild.id ? `<@&${member.roles.highest.id}>` : "None"}`));
            }
        }

        await interaction.reply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2],
            allowedMentions: { parse: [] }
        });
    }
}