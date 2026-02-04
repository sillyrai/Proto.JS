import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import ItemSchema from "../../../../Schemas/ItemSchema";
import Database from "../../../../Modules/Database";
import TextParser from "../../../../Modules/TextParser";


module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("shop")
        .setDescription("💸 View and buy items from the shop!"),
                  
    async execute(interaction: ChatInputCommandInteraction) {
        let items = await ItemSchema.find({onsale: true});
        const ITEMS_PER_PAGE = 5;
        let currentPage = 0;

        const generateShop = (page: number) => {
            const start = page * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            const currentItems = items.slice(start, end);

            let Response = new ContainerBuilder();
            Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## :shopping_cart: Shop
Browse and buy items from the shop below!
Page ${page + 1}/${Math.ceil(items.length / ITEMS_PER_PAGE)}`));
            Response.addSeparatorComponents(new SeparatorBuilder());

            for(let item of currentItems) {
                let itemSection = new SectionBuilder();
                itemSection.addTextDisplayComponents(new TextDisplayBuilder().setContent(`ID: \`${item._id}\`
**Name**: ${item.info.name}
**Description**: ${item.info.description}
**Price**: ${TextParser.BigIntComma(item.prices.buy)} coins`));
                itemSection.setButtonAccessory(new ButtonBuilder()
                    .setLabel("🛒 Buy")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`buy_item_${item._id}`));
                Response.addSectionComponents(itemSection);
                Response.addSeparatorComponents(new SeparatorBuilder());
            }
            return Response;
        }

        const generateButtons = (page: number) => {
            const maxPage = Math.ceil(items.length / ITEMS_PER_PAGE) - 1;
            const row = new ActionRowBuilder<ButtonBuilder>();
            
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_prev')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('shop_next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === maxPage)
            );
            return row;
        }

        let components: any[] = [generateShop(0)];
        if (items.length > ITEMS_PER_PAGE) {
            components.push(generateButtons(0));
        }

        let resp = await interaction.reply({ 
            components: components,
            flags: [MessageFlags.IsComponentsV2],
        });

        if (items.length > ITEMS_PER_PAGE) {
            const collector = resp.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id && ['shop_prev', 'shop_next'].includes(i.customId),
                time: 60000 * 5 // 5 minutes
            });

            collector.on('collect', async i => {
                const maxPage = Math.ceil(items.length / ITEMS_PER_PAGE) - 1;
                if (i.customId === 'shop_prev') {
                    currentPage = Math.max(0, currentPage - 1);
                } else if (i.customId === 'shop_next') {
                    currentPage = Math.min(maxPage, currentPage + 1);
                }

                await i.update({
                    components: [generateShop(currentPage), generateButtons(currentPage)],
                    flags: [MessageFlags.IsComponentsV2]
                });
            });
        }

        // Buy item interaction handling
        const buyCollector = resp.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id && i.customId.startsWith('buy_item_'),
            time: 60000 * 5 // 5 minutes
        });
        buyCollector.on('collect', async i => {
            const itemId = i.customId.replace('buy_item_', '');
            let dbItem = await Database.getItem(itemId);
            if(!dbItem) {
                await i.reply({ 
                    content: `Item not found in database.`, 
                    flags: [MessageFlags.Ephemeral]
                });
                return;
            }

            let dbUser = await Database.getUser(interaction.user.id);
            if(BigInt(dbUser.economy.balance) < BigInt(dbItem.prices.buy)) {
                await i.reply({ 
                    content: `You don't have enough coins to buy **${dbItem.info.name}**.`,
                    flags: [MessageFlags.Ephemeral]
                });
                return;
            }

            // Deduct balance and add item to inventory
            dbUser.economy.balance = (BigInt(dbUser.economy.balance) - BigInt(dbItem.prices.buy)).toString();
            let inventoryItem = dbUser.economy.inventory.find(it => it._id === itemId);
            if(inventoryItem) {
                inventoryItem.quantity = (BigInt(inventoryItem.quantity) + BigInt(1)).toString();
            } else {
                dbUser.economy.inventory.push({ _id: itemId, quantity: "1" });
            }
            await dbUser.save();
            await i.reply({ 
                content: `You have successfully purchased **${dbItem.info.name}** for **${dbItem.prices.buy} coins**!`, 
                flags: [MessageFlags.Ephemeral] 
            });
        });
    }
}