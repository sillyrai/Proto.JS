import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!")
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
        
        let Container = new ContainerBuilder();
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Pong! 🏓`));
        Container.addSeparatorComponents(new SeparatorBuilder())
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`Latency: ${latency}ms`));

        await interaction.reply({ 
            components: [Container], 
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}