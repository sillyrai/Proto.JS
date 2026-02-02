import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MediaGalleryBuilder, MediaGalleryComponent, MediaGalleryItemBuilder, MessageFlags, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Get someones avatar!")
        .addUserOption(option => 
            option.setName("target")
                .setDescription("The user to get the avatar of")
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
        const target = interaction.options.getUser("target") || interaction.user;

        let Container = new ContainerBuilder();
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Avatar for ${target.tag}`));
        Container.addSeparatorComponents(new SeparatorBuilder())
        let Gallery = new MediaGalleryBuilder();
        Gallery.addItems(new MediaGalleryItemBuilder().setURL(target.avatarURL({ size: 2048 }) || target.defaultAvatarURL));
        Container.addMediaGalleryComponents(Gallery);

        let ButtonRow = new ActionRowBuilder<ButtonBuilder>();
        ButtonRow.addComponents(new ButtonBuilder()
            .setLabel("128x")
            .setStyle(ButtonStyle.Link)
            .setURL(target.avatarURL({ size: 128 }) || target.defaultAvatarURL)
        )
        ButtonRow.addComponents(new ButtonBuilder()
            .setLabel("256x")
            .setStyle(ButtonStyle.Link)
            .setURL(target.avatarURL({ size: 256 }) || target.defaultAvatarURL)
        )
        ButtonRow.addComponents(new ButtonBuilder()
            .setLabel("512x")
            .setStyle(ButtonStyle.Link)
            .setURL(target.avatarURL({ size: 512 }) || target.defaultAvatarURL)
        )
        ButtonRow.addComponents(new ButtonBuilder()
            .setLabel("1024x")
            .setStyle(ButtonStyle.Link)
            .setURL(target.avatarURL({ size: 1024 }) || target.defaultAvatarURL)
        )
        
        // if user has guild avatar
        if(interaction.guild) {
            const member = await interaction.guild.members.fetch(target.id).catch(() => null);
            if(member && member.avatar) {
                Gallery.addItems(new MediaGalleryItemBuilder().setURL(member.displayAvatarURL({ size: 2048 }) || target.defaultAvatarURL));
                Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Note: User has a guild-specific avatar, so both avatars are shown! First row is global avatar, second row is guild avatar.`));
            }
        }
        Container.addActionRowComponents(ButtonRow);

        if(interaction.guild) {
            const member = await interaction.guild.members.fetch(target.id).catch(() => null);
            if(member && member.avatar) {
                let GuildButtonRow = new ActionRowBuilder<ButtonBuilder>();
                GuildButtonRow.addComponents(new ButtonBuilder()
                    .setLabel("Guild 128x")
                    .setStyle(ButtonStyle.Link)
                    .setURL(member.displayAvatarURL({ size: 128 }) || target.defaultAvatarURL)
                )
                GuildButtonRow.addComponents(new ButtonBuilder()
                    .setLabel("Guild 256x")
                    .setStyle(ButtonStyle.Link)
                    .setURL(member.displayAvatarURL({ size: 256 }) || target.defaultAvatarURL)
                )
                GuildButtonRow.addComponents(new ButtonBuilder()
                    .setLabel("Guild 512x")
                    .setStyle(ButtonStyle.Link)
                    .setURL(member.displayAvatarURL({ size: 512 }) || target.defaultAvatarURL)
                )
                GuildButtonRow.addComponents(new ButtonBuilder()
                    .setLabel("Guild 1024x")
                    .setStyle(ButtonStyle.Link)
                    .setURL(member.displayAvatarURL({ size: 1024 }) || target.defaultAvatarURL)
                )
                
                Container.addActionRowComponents(GuildButtonRow);
            }
        }





        await interaction.reply({ 
            components: [Container], 
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}