import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, Message, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import TextParser from "../../../Modules/TextParser";
import Database from "../../../Modules/Database";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("🎲 if you know, you know.")
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

        // Helper functions to use in eval
        const giveItem = async (userId: string, itemId: string, quantity: string = "1") => {
            let dbUser = await Database.getUser(userId);
            let inventoryItem = dbUser.economy.inventory.find(i => i._id === itemId);
            if(inventoryItem) {
                inventoryItem.quantity = (BigInt(inventoryItem.quantity) + BigInt(quantity)).toString();
            } else {
                dbUser.economy.inventory.push({ _id: itemId, quantity: quantity });
            }
            await dbUser.save();
            return "Gave " + quantity + " of item " + itemId + " to user " + userId;
        };

        const setMoney = async (userId: string, amount: string) => {
            let dbUser = await Database.getUser(userId);
            dbUser.economy.balance = amount;
            await dbUser.save();
            return "Set money of user " + userId + " to " + amount;
        }

        const createItem = async (id:string, name:string, description:string="No Description", buyPrice:string="0", sellPrice:string="0", consumable:boolean=false, onsale:boolean=false) => {
            let existingItem = await Database.getItem(id);
            if(existingItem) {
                return "Item with ID " + id + " already exists.";
            }
            let result = await Database.createItem(id,name,description,BigInt(buyPrice),BigInt(sellPrice),consumable,onsale);
            return "Created item with ID " + id + ": " + result;
        };

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