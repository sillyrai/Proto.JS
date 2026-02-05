import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder } from "discord.js";
import Database from "../../../../Modules/Database";
import TextParser from "../../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("give")
        .setDescription("🎒 Give an item to another user")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user whose inventory you want to view")
                .setRequired(true))
        .addStringOption(option => 
            option.setName("inventory_item")
                .setDescription("The ID of the item to give")
                .setRequired(true)
                .setAutocomplete(true)
            )
        .addStringOption(option =>
            option.setName("quantity")
                .setDescription("The quantity of the item you want to give (default: 1)")
                .setRequired(false)
        ),
                
    async execute(interaction: ChatInputCommandInteraction) {
        let recipient = interaction.options.getUser("user", true);
        const itemId = interaction.options.getString("inventory_item", true);
        let quantity:string|null = interaction.options.getString("quantity") || "1";

        quantity = (TextParser.SuffixNumber(quantity))?.toString() || null;
        if(!quantity || BigInt(quantity) <= 0) {
            await interaction.reply({ content: `Please enter a valid quantity to give.`, ephemeral: true });
            return;
        }
        // Ignore if target is caller
        if(recipient.id === interaction.user.id) {
            await interaction.reply({ content: `You cannot give an item to yourself.`, ephemeral: true });
            return;
        }

        // Check if user has the item, item name is equal to _id
        let dbUser = await Database.getUser(interaction.user.id);
        let recipientDbUser = await Database.getUser(recipient.id);
        
        let inventoryItem = dbUser.economy.inventory.find(i => i._id === itemId);
        if(!inventoryItem) {
            await interaction.reply({ content: `You don't have an item named **${itemId}** in your inventory.`, ephemeral: true });
            return;
        }

        if(BigInt(inventoryItem.quantity) < BigInt(quantity)) {
            await interaction.reply({ content: `You don't have enough quantity of **${itemId}** to give. You have ${inventoryItem.quantity}.`, ephemeral: true });
            return;
        }
        let actualItem = await Database.getItem(itemId);
        if(!actualItem) {
            await interaction.reply({ content: `The item **${itemId}** does not exist.`, ephemeral: true });
            return;
        }
        // If user has more than the quantity to give, reduce quantity by that amount, else remove from inventory
        if(BigInt(inventoryItem.quantity) > BigInt(quantity))
            inventoryItem.quantity = (BigInt(inventoryItem.quantity) - BigInt(quantity)).toString();
        else
            dbUser.economy.inventory.pull({ _id: itemId });
        await dbUser.save();
        // Add the item to the recipient's inventory, if they already have it, increase quantity, else add new item
        let recipientInventoryItem = recipientDbUser.economy.inventory.find(i => i._id === itemId);
        if(recipientInventoryItem) {
            recipientInventoryItem.quantity = (BigInt(recipientInventoryItem.quantity) + BigInt(quantity)).toString();
        }
        else {
            recipientDbUser.economy.inventory.push({ _id: itemId, quantity: quantity });
        }
        await recipientDbUser.save();


        let ResponseContainer = new ContainerBuilder();
        ResponseContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`You have given **${quantity}** of **${itemId}** to **${recipient.username}**.`));
        await interaction.reply({ 
            components: [ResponseContainer], 
            flags: [MessageFlags.IsComponentsV2] 
        });
    }
}