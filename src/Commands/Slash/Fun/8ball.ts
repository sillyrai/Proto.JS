import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import TextParser from "../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("8ball")
        .setDescription("🎱 Ask an 8ball a question, though answers might be a bit... unpredictable.")
        .addStringOption(option => 
            option.setName("message")
                .setDescription("The message to ask the 8ball")
                .setRequired(true))
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
        const responses = [
            "Uhh, probably?",
            "You wish :sob: :sob: :sob:",
            "YES YES YES ABSOLUTELY YES",
            "No.",
            "Maybe, maybe not. Who knows?",
            "I don't even know how to respond to that one, what the hell man.",
            "Absolutely, always and forever :3",
            "No way, not in a million years.",
            "HELL NO",
            "I have a bad feeling about this one, but yes.",
            "I have a good feeling about this one, but no.",
            ":worried: :worried: :worried:",
            "YES!!!!!!!!!!!!!!!!!!!!!!!!!!",
            "NO!!!!!!!!!!!!!!!!!!!!!!!!!!",
            "Why would you even ask that? Just... no.",
            "I don't think I can legally answer that",
            "Ew dude what the hell",
            "The answer is hidden in the stars, but I'm not gonna tell you what it is.",
            "The spirits say... maybe? I dunno, ask again later.",
            "The spirits are confused by your question, try asking something else.",
            "You should know the answer to that one already, just trust your instincts.",
            "You should probably ask someone else"
        ];

        const question = interaction.options.getString("message", true);
        let hash = 0;
        for (let i = 0; i < question.length; i++) {
            hash = question.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % responses.length;
        const answer = responses[index];

        let Response = new ContainerBuilder();
        Response.addSectionComponents(new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 🎱 8ball Result
**Question:** ${question}
**Answer:** ${answer}`))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(interaction.client.user?.displayAvatarURL({ size: 256 }) || "")));
        
        await interaction.reply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2],
            allowedMentions: { parse: [] }
        });
    }
}