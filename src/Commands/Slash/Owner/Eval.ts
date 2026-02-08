import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionCallbackResource, InteractionContextType, Message, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import TextParser from "../../../Modules/TextParser";
import Database from "../../../Modules/Database";
import Logger from "../../../Modules/Logger";

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

        // Return the guilds with the most members and their id
        // ID - memberCount
        function topServers(limit: number = 10) {
            let resp = "";
            let guilds = interaction.client.shard?.broadcastEval((client) => {
                return client.guilds.cache.map(guild => ({ id: guild.id, memberCount: guild.memberCount }));
            }) || Promise.resolve([]);
            return guilds.then(results => {
                let allGuilds: { id: string, memberCount: number }[] = [];
                for(const guildList of results) {
                    allGuilds = allGuilds.concat(guildList as { id: string, memberCount: number }[]);
                }
                allGuilds.sort((a, b) => b.memberCount - a.memberCount);
                allGuilds.slice(0, limit).forEach(guild => {
                    resp += `ID: ${guild.id} - Members: ${guild.memberCount}\n`;
                });
                return resp;
            });
        }

        function dbUser(id: string) {
            return Database.getUser(id);
        }

        function getGlobalUserCount() {
            let members = interaction.client.shard?.broadcastEval((client) => {
                return client.guilds.cache.reduce((acc, guild) => {
                    return acc + guild.memberCount;
                }, 0);
            }) || Promise.resolve([]);
            return members.then(results => {
                let totalMembers = 0;
                for(const count of results) {
                    totalMembers += count as number;
                }
                return totalMembers;
            });
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