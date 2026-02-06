import { ChatInputCommandInteraction, ContainerBuilder, SeparatorBuilder, TextDisplayBuilder, MessageFlags } from "discord.js";
import Logger from "../../../../../Modules/Logger";
module.exports = {
    async execute(interaction: ChatInputCommandInteraction, item: any, dbUser: any) {
        let rand = Math.random() * 100;
        Logger.info(`Lottery ticket roll: ${rand}`);
        let reward = 0;
        if(rand < 0.001)
            reward = 100000;
        else if(rand < 0.01)
            reward = 50000;
        else if (rand < 0.1)
            reward = 10000;
        else if (rand < 1)
            reward = 5000;
        else if (rand < 5)
            reward = 1000;
        else if (rand < 20)
            reward = 500;
        else if (rand < 30)
            reward = 100;
        let Container = new ContainerBuilder()
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## :ticket: You used a lottery ticket!`));
        Container.addSeparatorComponents(new SeparatorBuilder());
        if(reward > 0) {
            dbUser.economy.balance = (BigInt(dbUser.economy.balance) + BigInt(reward.toString())).toString();
            await dbUser.save();
            
            Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`:tada: Congratulations! You won **${reward}** coins from the lottery ticket!`));

            await interaction.reply({ 
                components: [Container], 
                flags: [MessageFlags.IsComponentsV2]
            });
        }
        else {
            Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`:x: Sorry, you didn't win anything this time. Better luck next time!`));

            await interaction.reply({ 
                components: [Container], 
                flags: [MessageFlags.IsComponentsV2]
            });
        }
    }
}