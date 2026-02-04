import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import TextParser from "../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("furryrate")
        .setDescription("🦊 Rate how much of a furry someone is!")
        .addUserOption(option => 
            option.setName("user")
                .setDescription("The user to rate")
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
        let targetUser = interaction.options.getUser("user") || interaction.user;

        // Random number between 0 and 110 (110 for funny)
        let rate = Math.floor(Math.random() * 111);

        let Container = new ContainerBuilder();
        let FurredAnimalEmojis = ["🐶", "🐱", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🦄", "🐰", "🐹", "🐾"];
        let randomEmoji = FurredAnimalEmojis[Math.floor(Math.random() * FurredAnimalEmojis.length)];
        Container.addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${randomEmoji} Furry Rate for @${TextParser.EscapeSymbols(targetUser.tag)}
### ${targetUser.displayName} is **${rate}%** a furry! 🐾`))
.setThumbnailAccessory(new ThumbnailBuilder()
                .setURL(targetUser.displayAvatarURL({ size: 256}))
            )
        );
        
        await interaction.reply({ 
            components: [Container], 
            flags: [MessageFlags.IsComponentsV2],
            allowedMentions: { users: [] }
        });
    }
}