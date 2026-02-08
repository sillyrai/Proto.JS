import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder } from "discord.js";
import Database from "../../../../Modules/Database";
import TextParser from "../../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("view")
        .setDescription("🎒 View your or someone else's inventory")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user whose inventory you want to view")
                .setRequired(false)),
                
    async execute(interaction: ChatInputCommandInteraction) {
        let user = interaction.options.getUser("user") || interaction.user;

        let dbUser = await Database.getUser(user.id);
        let inventory = dbUser.economy.inventory.filter((item: any) => item.quantity > 0);

        if (inventory.length === 0) {
            await interaction.reply({ content: `${user.username}'s inventory is empty.`, ephemeral: true });
            return;
        }

        const ITEMS_PER_PAGE = 5;
        let currentPage = 0;

        const generateInventory = async (page: number) => {
            const start = page * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            const currentItems = inventory.slice(start, end);

            let Response = new ContainerBuilder();
            Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## :school_satchel: Inventory of ${user.username}
View your items below!
Page ${page + 1}/${Math.ceil(inventory.length / ITEMS_PER_PAGE)}`));
            Response.addSeparatorComponents(new SeparatorBuilder());

            for(let item of currentItems) {
                let dbItem = await Database.getItem(item._id);
                let name = dbItem ? dbItem.info.name : "Unknown Item";
                let description = dbItem ? dbItem.info.description : "No description available.";

                let itemSection = new TextDisplayBuilder();
                itemSection.setContent(`ID: \`${item._id}\`
**Name**: ${name}
**Description**: ${description}
**Quantity**: ${TextParser.SizeSuffix(item.quantity)}`);
                
                Response.addTextDisplayComponents(itemSection);
                Response.addSeparatorComponents(new SeparatorBuilder());
            }
            Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# You can use your items with \`/inventory item <item_id>\` command`));
            return Response;
        }

        const generateButtons = (page: number) => {
            const maxPage = Math.ceil(inventory.length / ITEMS_PER_PAGE) - 1;
            const row = new ActionRowBuilder<ButtonBuilder>();
            
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('inv_prev')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('inv_next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === maxPage)
            );
            return row;
        }

        let components: any[] = [await generateInventory(0)];
        if (inventory.length > ITEMS_PER_PAGE) {
            components.push(generateButtons(0));
        }

        let resp = await interaction.reply({ 
            components: components,
            flags: [MessageFlags.IsComponentsV2],
        });

        if (inventory.length > ITEMS_PER_PAGE) {
            const collector = resp.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id && ['inv_prev', 'inv_next'].includes(i.customId),
                time: 60000 * 5 // 5 minutes
            });

            collector.on('collect', async i => {
                const maxPage = Math.ceil(inventory.length / ITEMS_PER_PAGE) - 1;
                if (i.customId === 'inv_prev') {
                    currentPage = Math.max(0, currentPage - 1);
                } else if (i.customId === 'inv_next') {
                    currentPage = Math.min(maxPage, currentPage + 1);
                }

                await i.update({
                    components: [await generateInventory(currentPage), generateButtons(currentPage)],
                    flags: [MessageFlags.IsComponentsV2]
                });
            });
        }
    }
}