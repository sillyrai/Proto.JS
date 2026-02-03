import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, Message, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import TextParser from "../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("if you know, you know.")
        .addStringOption(option => 
            option.setName("code")
                .setDescription("dont u even try")
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
        const code = interaction.options.getString("code", true);

        let FakeExceptions = [ // lol, lmao even
            "ReferenceError: client is not defined",
            "TypeError: Cannot read properties of undefined (reading 'id')",
            "SyntaxError: Unexpected token '}'",
            "RangeError: Maximum call stack size exceeded",
            "ReferenceError: args is not defined",
            "SyntaxError: Unexpected end of input",
            "DiscordAPIError[10062]: Unknown interaction",
            "TypeError: Cannot read properties of null (reading 'guild')",
            "Error: Request timed out",
            "TypeError: Cannot read properties of undefined (reading 'send')"
        ]

        let Response = new ContainerBuilder();
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`:inbox_tray: Input:\n\`\`\`ts\n${code}\n\`\`\``));
        if(interaction.user.id !== process.env.OWNER_ID) {
            let fake = FakeExceptions[Math.floor(Math.random() * FakeExceptions.length)];
            Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`:outbox_tray: Output:\n\`\`\`ts\n${fake}\n\`\`\``));
            await interaction.reply({ 
                components: [Response],
                flags: [MessageFlags.IsComponentsV2]
            });
            return;
        }

        try {
            let evaled = await eval(code);
            if(typeof evaled !== "string") {
                evaled = require("util").inspect(evaled, { depth: 0 });
            }
            Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`:outbox_tray: Output:\n\`\`\`ts\n${evaled}\n\`\`\``));
        } catch (error) {
            Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`:outbox_tray: Output:\n\`\`\`ts\n${error}\n\`\`\``));
        }
        await interaction.reply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}