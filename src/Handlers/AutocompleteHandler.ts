import { Client, Events } from "discord.js";
import Database from "../Modules/Database";

export default function(client: Client) {
    client.on(Events.InteractionCreate, async (interaction) => {
        if(!interaction.isAutocomplete()) return;

        // if the field that is being autocompleted is "inventory_item", provide item suggestions from the persons inventory
        if(interaction.options.getFocused(true).name !== "inventory_item")
            return;

        let dbUser = await Database.getUser(interaction.user.id);
        // fetch item names from inventory
        let itemIds = dbUser.economy.inventory.map(i => i._id);
        let items = []
        for(let itemId of itemIds) {
            let dbItem = await Database.getItem(itemId);
            if(dbItem) {
                items.push(dbItem);
            }
        }

        let focusedValue = interaction.options.getFocused();
        let choices = items.map(i => ({ name: i.info.name, value: i._id }));

        // filter choices based on focused value
        choices = choices.filter(choice => choice.name.toLowerCase().includes(focusedValue.toLowerCase()));

        // limit to maximum 25 choices
        choices = choices.slice(0, 25);

        await interaction.respond(choices);
    });
}