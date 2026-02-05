import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Database from "../../../../Modules/Database";
import TextParser from "../../../../Modules/TextParser";
import fs from "fs";
module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("buy")
        .setDescription("🎒 Buy an item for your inventory")
        .addStringOption(option => 
            option.setName("shop_item")
                .setDescription("The ID of the item you want to buy")
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addStringOption(option =>
                option.setName("quantity")
                    .setDescription("The quantity of the item you want to buy (default: 1)")
                    .setRequired(false)
            ),
                
                
    async execute(interaction: ChatInputCommandInteraction) {
        const itemId = interaction.options.getString("shop_item", true);
        let quantity:string|null = interaction.options.getString("quantity") || "1";

        quantity = (TextParser.SuffixNumber(quantity))?.toString() || null;

        if(!quantity || BigInt(quantity) <= 0) {
            await interaction.reply({ content: `Please enter a valid quantity to buy.`, ephemeral: true });
            return;
        }

        // Check if item exists in shop
        let item = await Database.getItem(itemId);
        if(!item || !item.onsale) {
            await interaction.reply({ content: `The item **${itemId}** is not available for purchase.`, ephemeral: true });
            return;
        }

        if(!item.prices.buy) {
            await interaction.reply({ content: `The item **${itemId}** cannot be bought.`, ephemeral: true });
            return;
        }

        // Check if user has enough balance to buy the item
        let dbUser = await Database.getUser(interaction.user.id);
        const totalBuyPrice = BigInt(item.prices.buy) * BigInt(quantity);
        if(BigInt(dbUser.economy.balance) < totalBuyPrice) {
            await interaction.reply({ content: `You don't have enough coins to buy **${quantity}** of **${itemId}**. You need ${TextParser.BigIntComma(totalBuyPrice)} coins, but you only have ${TextParser.BigIntComma(dbUser.economy.balance)} coins.`, ephemeral: true });
            return;
        }

        // Give user a confirmation message with buttons to confirm or cancel the purchase, also display how much the total cost of the purchase will be
        const confirm = new ContainerBuilder();
        confirm.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## :warning: Confirmation`))
        confirm.addSeparatorComponents(new SeparatorBuilder())
        confirm.addTextDisplayComponents(new TextDisplayBuilder().setContent(`Are you sure you want to buy **${quantity}** of **${itemId}** for a total of **${TextParser.BigIntComma(totalBuyPrice)}** coins?`))

        let ButtonRow = new ActionRowBuilder<ButtonBuilder>();
        ButtonRow.addComponents(
            new ButtonBuilder()
                .setCustomId("confirm_buy")
                .setLabel("Confirm")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("cancel_buy")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Danger)
        );

        let response = await interaction.reply({ 
            components: [confirm, ButtonRow], 
            flags: [MessageFlags.IsComponentsV2]
        });

        const filter = (i: any) => {
            return i.user.id === interaction.user.id && (i.customId === "confirm_buy" || i.customId === "cancel_buy");
        }

        const collector = response.createMessageComponentCollector({ filter, time: 60000 });
        collector.on("collect", async (i: any) => {
            let ResponseContainer = new ContainerBuilder();
            if(i.customId === "confirm_buy") {
                // Add the bought items to the user's inventory
                let inventoryItem = dbUser.economy.inventory.find(i => i._id === itemId);
                if(inventoryItem) {
                    inventoryItem.quantity = (BigInt(inventoryItem.quantity) + BigInt(quantity)).toString();
                } else {
                    dbUser.economy.inventory.push({ _id: itemId, quantity: quantity });
                }
                // Deduct the total buy price from the user's balance
                dbUser.economy.balance = (BigInt(dbUser.economy.balance) - totalBuyPrice).toString();

                await dbUser.save();

                ResponseContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`You have successfully bought **${quantity}** of **${itemId}** for a total of **${TextParser.BigIntComma(totalBuyPrice)}** coins.`));
                await i.update({ components: [ResponseContainer], flags: [MessageFlags.IsComponentsV2] });
                collector.stop();
            } else if(i.customId === "cancel_buy") {
                ResponseContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`Purchase cancelled.`));
                await i.update({ components: [ResponseContainer], flags: [MessageFlags.IsComponentsV2] });
                collector.stop();
            }
        });
    }
}