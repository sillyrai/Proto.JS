import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Database from "../../../../Modules/Database";
import TextParser from "../../../../Modules/TextParser";
import fs from "fs";
module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("sell")
        .setDescription("🎒 Sell an item from your inventory")
        .addStringOption(option => 
            option.setName("inventory_item")
                .setDescription("The ID of the item you want to sell")
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addStringOption(option =>
                option.setName("quantity")
                    .setDescription("The quantity of the item you want to sell (default: 1)")
                    .setRequired(false)
            ),
                
                
    async execute(interaction: ChatInputCommandInteraction) {
        const itemId = interaction.options.getString("inventory_item", true);
        let quantity:string|null = interaction.options.getString("quantity") || "1";

        quantity = (TextParser.SuffixNumber(quantity))?.toString() || null;

        if(!quantity || BigInt(quantity) <= 0) {
            await interaction.reply({ content: `Please enter a valid quantity to sell.`, ephemeral: true });
            return;
        }

        // Check if user has the item, item name is equal to _id
        let dbUser = await Database.getUser(interaction.user.id);
        
        let inventoryItem = dbUser.economy.inventory.find(i => i._id === itemId);
        if(!inventoryItem) {
            await interaction.reply({ content: `You don't have an item named **${itemId}** in your inventory.`, ephemeral: true });
            return;
        }
        let actualItem = await Database.getItem(itemId);
        
        if(!actualItem?.prices.sell) {
            await interaction.reply({ content: `The item **${itemId}** cannot be sold.`, ephemeral: true });
            return;
        }

        if(BigInt(inventoryItem.quantity) < BigInt(quantity)) {
            await interaction.reply({ content: `You don't have enough quantity of **${itemId}** to sell. You have ${inventoryItem.quantity}.`, ephemeral: true });
            return;
        }

        // Give user a confirmation message with buttons to confirm or cancel the sale, also display how much they will earn from the sale
        const totalSellPrice = BigInt(actualItem.prices.sell) * BigInt(quantity);

        const confirm = new ContainerBuilder();
        confirm.addTextDisplayComponents(new TextDisplayBuilder().setContent(`:warning: Confirmation`))
        confirm.addSeparatorComponents(new SeparatorBuilder())
        confirm.addTextDisplayComponents(new TextDisplayBuilder().setContent(`Are you sure you want to sell **${quantity}** of **${itemId}** for a total of **${TextParser.BigIntComma(totalSellPrice)}** coins?`))

        let ButtonRow = new ActionRowBuilder<ButtonBuilder>();
        const confirmButton = new ButtonBuilder().setCustomId("confirm_sell")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Success);
        const cancelButton = new ButtonBuilder().setCustomId("cancel_sell")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger);
        ButtonRow.addComponents(confirmButton, cancelButton);

        let response = await interaction.reply({ 
            components: [confirm, ButtonRow], 
            flags: [MessageFlags.IsComponentsV2]
        });

        const filter = (i: any) => {
            return i.user.id === interaction.user.id && (i.customId === "confirm_sell" || i.customId === "cancel_sell");
        }

        const collector = response.createMessageComponentCollector({ filter, time: 60000 });
        collector.on("collect", async (i: any) => {
            let ResponseContainer = new ContainerBuilder();
            if(i.customId === "confirm_sell") {
                // Remove the sold items from the user's inventory
                if(BigInt(inventoryItem.quantity) === BigInt(quantity)) {
                    dbUser.economy.inventory.pull({ _id: itemId });
                } else {
                    inventoryItem.quantity = (BigInt(inventoryItem.quantity) - BigInt(quantity)).toString();
                }
                // Add the coins to the user's balance
                dbUser.economy.balance = (BigInt(dbUser.economy.balance) + totalSellPrice).toString();
                await dbUser.save();
                ResponseContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`You have sold **${quantity}** of **${itemId}** for a total of **${TextParser.BigIntComma(totalSellPrice)}** coins.`));
                await i.update({ components: [ResponseContainer], flags: [MessageFlags.IsComponentsV2] });
                //await i.update({ content: `You have sold **${quantity}** of **${itemId}** for a total of **${TextParser.BigIntComma(totalSellPrice)}** coins.`, components: [] });
            } else if(i.customId === "cancel_sell") {
                //await i.update({ content: `Sale cancelled.`, components: [], ephemeral: true });
                ResponseContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`Sale cancelled.`));
                await i.update({ components: [ResponseContainer], flags: [MessageFlags.IsComponentsV2] });
            }
        });

        collector.on("end", async (collected: any) => {
            if(collected.size === 0) {
                await response.edit({ content: `Sale cancelled due to inactivity.`, components: [] });
            }
        });
    }
}