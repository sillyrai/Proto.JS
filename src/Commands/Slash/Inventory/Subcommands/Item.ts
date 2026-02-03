import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SectionBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Database from "../../../../Modules/Database";
import TextParser from "../../../../Modules/TextParser";
import fs from "fs";
module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("item")
        .setDescription("Use an item from your inventory")
        .addStringOption(option => 
            option.setName("item_id")
                .setDescription("The ID of the item to use (you can view item IDs in your inventory)")
                .setRequired(true)),
                
                
    async execute(interaction: ChatInputCommandInteraction) {
        const itemId = interaction.options.getString("item_id", true);

        // Check if user has the item, item name is equal to _id
        let dbUser = await Database.getUser(interaction.user.id);
        
        let inventoryItem = dbUser.economy.inventory.find(i => i._id === itemId);
        if(!inventoryItem) {
            await interaction.reply({ content: `You don't have an item named **${itemId}** in your inventory.`, ephemeral: true });
            return;
        }
        let actualItem = await Database.getItem(itemId);
        
        // check if item exists in registry (__dirname/item_registy/{_id}.ts)
        if(fs.existsSync(`${__dirname}/item_registry/${itemId}.ts`)) {
            let itemModule = require(`${__dirname}/item_registry/${itemId}.ts`);
            await itemModule.execute(interaction, actualItem, dbUser);
        } else {
            await interaction.reply({ content: `The item **${itemId}** is not usable.`, ephemeral: false });
        }

        // if item is consumable, reduce quantity by 1 or remove from inventory
        if(!actualItem?.consumable) return;
        // If user has more than 1 of the item, reduce quantity by 1, else remove item from inventory
        if(inventoryItem.quantity > 1)
            inventoryItem.quantity -= 1;
        else 
            dbUser.economy.inventory.pull({ _id: itemId });

        await dbUser.save();
    }
}