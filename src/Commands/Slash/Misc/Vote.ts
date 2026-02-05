import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vote")
        .setDescription("🗳️ Displays how you can support the bot for free! :)")
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
        let Container = new ContainerBuilder();
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Vote for the bot! 🗳️`));
        Container.addSeparatorComponents(new SeparatorBuilder())
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`Running this bot for free is a challenge, 
but you can help support it by voting on top.gg!`));

        let ButtonRow = new ActionRowBuilder<ButtonBuilder>();
        ButtonRow.addComponents(
            new ButtonBuilder()
                .setLabel("Vote Now!")
                .setStyle(ButtonStyle.Link)
                .setURL("https://top.gg/bot/724601984241369100/vote")
        );
        ButtonRow.addComponents(
            new ButtonBuilder()
                .setLabel("Buy me a coffee!")
                .setStyle(ButtonStyle.Link)
                .setURL("https://www.ko-fi.com/raithefox")
        );

        await interaction.reply({ 
            components: [Container, ButtonRow], 
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}