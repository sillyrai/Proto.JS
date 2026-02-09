import { ActionRowBuilder, ChatInputCommandInteraction, ContainerBuilder, LabelBuilder, MessageFlags, ModalBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle, User, UserSelectMenuBuilder, UserSelectMenuInteraction } from "discord.js";
import Database from "../../../../../Modules/Database";
import TextParser from "../../../../../Modules/TextParser";
import Logger from "../../../../../Modules/Logger";
module.exports = {
    async execute(interaction: ChatInputCommandInteraction, item: any, dbUser: any) {
        /*
            Lets you throw a brick at a person, doing so can steal coins from them, but it can also backfire and cause you to lose coins. 
        */

        let UserSelect = new UserSelectMenuBuilder()
            .setCustomId("brick_target")
            .setPlaceholder("Select a user to throw the brick at")
            .setRequired(true)
        let userSelRow = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(UserSelect)

        let Container = new ContainerBuilder();
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent("Who do you want to throw the brick at?"))
        Container.addActionRowComponents(userSelRow)

        await interaction.reply({
            components: [Container],
            flags: [MessageFlags.IsComponentsV2]
        })

        // Handle the user selection
        let filter = (i: any) => i.customId === "brick_target" && i.user.id === interaction.user.id;
        let collector = interaction.channel?.createMessageComponentCollector({ filter, time: 60000, max: 1 });

        collector?.on("collect", async (i: UserSelectMenuInteraction) => {
            let targetUserId = i.values[0];
            let dbUser = await Database.getUser(interaction.user.id);
            let dbTargetUser = await Database.getUser(targetUserId);
            let UpdateResponse = new ContainerBuilder();

            let dbUserBal = dbUser.economy.balance;
            let dbTargetUserBal = dbTargetUser.economy.balance;

            /*
                33% chance to steal 5 to 30 % of the target's coins, 
                33% chance to steal nothing, 
                33% chance to lose 5 to 30 % of your coins.
            */
            let rand = Math.random();

            // check if user has "insurance" status effect (and it hasnt expired), if they do, rand is reduced by 80%
            let insuranceEffect = dbTargetUser.statusEffects.find((effect: any) => effect._id === "insurance" && new Date(effect.expiresAt) > new Date());
            if (insuranceEffect) {
                rand += 0.9;
            }
            Logger.debug(`Rand Chance: ${rand}`)

            if (rand < 0.33) {
                // Steal coins
                let percentage = Math.floor(Math.random() * 26) + 5; // 5 to 30 %
                let amountStolen = (BigInt(dbTargetUser.economy.balance) * BigInt(percentage)) / BigInt(100);
                dbUser.economy.balance = (BigInt(dbUser.economy.balance) + amountStolen).toString();
                dbTargetUser.economy.balance = (BigInt(dbTargetUser.economy.balance) - amountStolen).toString();
                UpdateResponse.addTextDisplayComponents(new TextDisplayBuilder().setContent(`You threw a brick at <@${targetUserId}> and stole ${amountStolen} coins!
${TextParser.NumDiffBigInt(dbUserBal, dbUser.economy.balance)}`))
                Database.giveEffect(targetUserId, "insurance", 1, new Date(Date.now() + 60 * 60 * 1000)) // give target "insurance" status effect for 1 hour
            }
            else if (rand < 0.66) {
                // Steal nothing
                UpdateResponse.addTextDisplayComponents(new TextDisplayBuilder().setContent(`You threw a brick at <@${targetUserId}> but it didn't do anything!`))
            }
            else {
                // Lose coins
                let percentage = Math.floor(Math.random() * 26) + 5; // 5 to 30 %
                let amountLost = (BigInt(dbUser.economy.balance) * BigInt(percentage)) / BigInt(100);
                dbUser.economy.balance = (BigInt(dbUser.economy.balance) - amountLost).toString();
                UpdateResponse.addTextDisplayComponents(new TextDisplayBuilder().setContent(`You threw a brick at <@${targetUserId}> but it backfired and you lost ${amountLost} coins!
${TextParser.NumDiffBigInt(dbUserBal, dbUser.economy.balance)}
${insuranceEffect ? ":warning: The target had insurance, drastically reducing the chances for you to steal from them!" : ""}`))
            }
            await dbUser.save();
            await dbTargetUser.save();
            await i.update({
                components: [UpdateResponse],
                flags: [MessageFlags.IsComponentsV2]
            });
        })

        collector?.on("end", async (collected, reason) => {
            if (reason === "time") {
                let TimeoutContainer = new ContainerBuilder();
                TimeoutContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent("You took too long to select a target!"))
                await interaction.editReply({
                    components: [TimeoutContainer],
                    flags: [MessageFlags.IsComponentsV2]
                })
            }
        })
    }
}