import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import TextParser from "../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("8ball")
        .setDescription("Ask an 8ball a question, though answers might be a bit... unpredictable.")
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
            "Yes, but you're not going to like why.",
            "Ask again when you're older.",
            "My sources say 'no', but they also say the earth is flat.",
            "I'm too tired to answer that right now.",
            "Have you tried turning it off and on again?",
            "404: Answer not found.",
            "Maybe, if the stars align and you buy me dinner.",
            "I'd tell you, but then I'd have to delete your server.",
            "Absolutely not. Wait, no. Maybe.",
            "Outlook good, unlike your fashion sense.",
            "Don't count on it, count on me instead.",
            "Reply hazy, try shaking your monitor.",
            "Signs point to... ask your mother.",
            "Better not tell you now, you might cry.",
            "Concentrate and ask again, but with more feeling.",
            "As I see it, yes. But I need glasses.",
            "It is certain... ly not happening.",
            "Very doubtful, like your chances of winning the lottery.",
            "Without a doubt... unless Tuesday.",
            "Yes - definitely. Probably. Ideally.",
            "You may rely on it, like a sturdy chair.",
            "Most likely to happen when pigs fly.",
            "Cannot predict now, I'm watching Netflix.",
            "My reply is no, and stop asking.",
            "Yes, in a parallel universe.",
            "Outlook not so good.",
            "It is decidedly so... confusing.",
            "I think I'm gonna call the police for this question.",
            "Hell yeah!",
            "Hell nah!"
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