import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SlashCommandBuilder, TextDisplayBuilder } from "discord.js";
import Database from "../../../Modules/Database";

// filepath: c:\Users\Rai\Desktop\Proto.JS\src\Commands\Slash\Owner\CreateItem.ts
// import ItemModel from "../../../Models/ItemSchema"; // Import your Mongoose model here

module.exports = {
    data: new SlashCommandBuilder()
        .setName("giveitem")
        .setDescription("Give yourself an item for testing purposes")
        .addStringOption(option => 
            option.setName("item_id")
                .setDescription("The ID of the item to give")
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName("quantity")
                .setDescription("The quantity of the item to give")
                .setRequired(true))
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to give the item to (defaults to yourself)")
                .setRequired(false)),
        
    async execute(interaction: ChatInputCommandInteraction) {
        if(interaction.user.id !== process.env.OWNER_ID) {
            await interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
            return;
        }
        let user = interaction.options.getUser("user") || interaction.user;

        const itemId = interaction.options.getString("item_id", true);
        const quantity = interaction.options.getInteger("quantity", true);

        let dbUser = await Database.getUser(user.id);
        let inventoryItem = dbUser.economy.inventory.find(i => i._id === itemId);
        if(inventoryItem) {
            inventoryItem.quantity += quantity;
        } else {
            dbUser.economy.inventory.push({ _id: itemId, quantity: quantity });
        }
        await dbUser.save();
        await interaction.reply({ content: `Gave ${quantity} of item ${itemId} to ${user.username}.`, ephemeral: true });
    }
}