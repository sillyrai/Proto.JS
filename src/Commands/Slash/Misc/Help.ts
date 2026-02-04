import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import TextParser from "../../../Modules/TextParser";
import config from "../../../config.json" assert { type: "json" };
module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("🔰 Information about the bot!")
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
        let latency = Math.abs(Date.now() - interaction.createdTimestamp);
        await interaction.deferReply();

        let creator = await interaction.client.users.fetch("285092930400813056", {force: true});
        let BotInfo = new ContainerBuilder();

        
        BotInfo.addMediaGalleryComponents(new MediaGalleryBuilder()
            .addItems(new MediaGalleryItemBuilder()
                .setURL("https://cdn.discordapp.com/attachments/1112329725856186380/1467892420732518616/ProtoBanner.png?ex=698208d9&is=6980b759&hm=6911809257b23f6716a8f33fddf545a2bcb39485a1d142195cd95f3a73961f6c&")));
        

        BotInfo.addTextDisplayComponents(new TextDisplayBuilder()
            .setContent(`-# Created by <:Proot:1467630707303252174> @${TextParser.EscapeSymbols(creator.tag)}`))

        BotInfo.addSeparatorComponents(new SeparatorBuilder());
        BotInfo.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# :blue_heart: Proto`));
        BotInfo.addTextDisplayComponents(new TextDisplayBuilder()
            .setContent(`Hi! I'm **Proto**, a general purpose bot made for furries by furries! 
You can view what commands I have by typing \`/\` `));

        let guildCount = interaction.client.shard ?
            (await interaction.client.shard.fetchClientValues('guilds.cache.size') as number[])
                .reduce((a, b) => a + b, 0)
            : interaction.client.guilds.cache.size;

        BotInfo.addSeparatorComponents(new SeparatorBuilder());
        BotInfo.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Bot Information
- **Version**: v${config.version.major}.${config.version.minor}.${config.version.patch}${config.version.suffix}
- **Ping**: ${latency}ms
- **Shard ID**: ${interaction.guild ? interaction.guild.shardId : 'N/A'}
- **Uptime**: <t:${Math.floor((Date.now() - interaction.client.uptime!) / 1000)}:R>
- **Servers**: ${guildCount}`));

        let ButtonRow = new ActionRowBuilder<ButtonBuilder>();
        ButtonRow.addComponents(new ButtonBuilder()
            .setLabel("Support Server")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/s4sSpxn5Hu")
        )

        ButtonRow.addComponents(new ButtonBuilder()
            .setLabel("Invite Proto")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/oauth2/authorize?client_id=${interaction.client.user?.id}`)
        )

        ButtonRow.addComponents(new ButtonBuilder()
            .setLabel("Vote on top.gg")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://top.gg/bot/${interaction.client.user?.id}/vote`)
        )

        await interaction.editReply({ 
            components: [BotInfo, ButtonRow], 
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}