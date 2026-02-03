import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SlashCommandBuilder, TextDisplayBuilder } from "discord.js";
import Database from "../../../Modules/Database";

// filepath: c:\Users\Rai\Desktop\Proto.JS\src\Commands\Slash\Owner\CreateItem.ts
// import ItemModel from "../../../Models/ItemSchema"; // Import your Mongoose model here

module.exports = {
    data: new SlashCommandBuilder()
        .setName("createitem")
        .setDescription("Create a new item for the economy system")
        .addStringOption(option => 
            option.setName("item_id")
                .setDescription("The unique ID for the item")
                .setRequired(true))
        .addStringOption(option => 
            option.setName("item_name")
                .setDescription("The display name for the item")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("item_description")
                .setDescription("The description for the item")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("buy_price")
                .setDescription("The buy price for the item")
                .setRequired(true))
        .addStringOption(option => 
            option.setName("sell_price")
                .setDescription("The sell price for the item")
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName("is_consumable")
                .setDescription("Whether the item is usable")
                .setRequired(true))
                .addBooleanOption(option =>
            option.setName("is_onsale")
                .setDescription("Whether the item is available for purchase")
                .setRequired(true)),
        
    async execute(interaction: ChatInputCommandInteraction) {
        if(interaction.user.id !== process.env.OWNER_ID) {
            await interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
            return;
        }
        const itemId = interaction.options.getString("item_id", true);
        const itemName = interaction.options.getString("item_name", true);
        const itemDescription = interaction.options.getString("item_description", true);
        const buyPrice = parseInt(interaction.options.getString("buy_price", true));
        const sellPrice = parseInt(interaction.options.getString("sell_price", true));
        const isConsumable = interaction.options.getBoolean("is_consumable", true);
        const isOnSale = interaction.options.getBoolean("is_onsale", true   );


        let Item = Database.createItem(itemId, itemName, itemDescription, BigInt(buyPrice), BigInt(sellPrice), isConsumable, isOnSale);
        await interaction.reply({ content: `\`\`\`json\n${JSON.stringify(Item, null, 2)}\n\`\`\``});
    }
}