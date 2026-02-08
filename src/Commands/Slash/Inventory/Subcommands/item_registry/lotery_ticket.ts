import { ChatInputCommandInteraction, ContainerBuilder, SeparatorBuilder, TextDisplayBuilder, MessageFlags } from "discord.js";
import Logger from "../../../../../Modules/Logger";
module.exports = {
    async execute(interaction: ChatInputCommandInteraction, item: any, dbUser: any) {
        let Container = new ContainerBuilder()
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## :ticket: You used a lottery ticket!`));
        Container.addSeparatorComponents(new SeparatorBuilder());

        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`:x: Sorry, you didn't win anything this time. Better luck next time!`));

        await interaction.reply({ 
            components: [Container], 
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}