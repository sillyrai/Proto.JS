import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Logger from "../../../Modules/Logger";
import TextParser from "../../../Modules/TextParser";
import config from "../../../config.json" assert { type: "json" };
module.exports = {
    data: new SlashCommandBuilder()
        .setName("about")
        .setDescription("Information about the bot!")
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
        await interaction.deferReply();

        let creator = await interaction.client.users.fetch("285092930400813056", {force: true});
        let banner = creator.bannerURL({size:1024}) || "No Banner";
        let BotInfo = new ContainerBuilder();
        /*
        BotInfo.addMediaGalleryComponents(new MediaGalleryBuilder()
            .addItems(new MediaGalleryItemBuilder()
                .setURL(banner)));
*/
        BotInfo.addTextDisplayComponents(new TextDisplayBuilder()
            .setContent(`-# Created by <:Proot:1467630707303252174> @${TextParser.EscapeSymbols(creator.tag)}`))

        BotInfo.addSeparatorComponents(new SeparatorBuilder());
        BotInfo.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# :robot: Proto`));
        BotInfo.addTextDisplayComponents(new TextDisplayBuilder()
            .setContent(`Hi! I'm **Proto**, a general purpose bot made for furries by furries!`));

        BotInfo.addSeparatorComponents(new SeparatorBuilder());
        BotInfo.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Bot Information
- **Version**: v${config.version.major}.${config.version.minor}.${config.version.patch}${config.version.suffix}
- **Ping**: ${Date.now() - interaction.createdTimestamp}ms
- **Library**: discord.js
- **Shard ID**: ${interaction.guild ? interaction.guild.shardId : 'N/A'}
- **Uptime**: <t:${Math.floor((Date.now() - interaction.client.uptime!) / 1000)}:R>`));

        await interaction.followUp({ 
            components: [BotInfo], 
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}