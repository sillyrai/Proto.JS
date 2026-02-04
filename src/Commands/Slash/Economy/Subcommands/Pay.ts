import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SectionBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Database from "../../../../Modules/Database";
import TextParser from "../../../../Modules/TextParser";
import Logger from "../../../../Modules/Logger";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("pay")
        .setDescription("💸 Give some of your money to another user")
        .addUserOption(option => 
            option.setName("target")
                .setDescription("The user to pay")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("amount")
                .setDescription("The amount of money to pay")
                .setRequired(true)),
                
                
    async execute(interaction: ChatInputCommandInteraction) {
        const target = interaction.options.getUser("target", true);
        const amountStr = interaction.options.getString("amount", true);

        const amount = TextParser.SuffixNumber(amountStr);
        if(amount === null){
            return await interaction.reply({ content: `The amount you provided is invalid. Please provide a valid number with optional suffix (k, m, b, t).`, flags: [MessageFlags.Ephemeral] });
        }
        if(amount <= 0n){
            return await interaction.reply({ content: `The amount you provided must be greater than zero.`, flags: [MessageFlags.Ephemeral] });
        }
        let dbUser = await Database.getUser(interaction.user.id);
        if (BigInt(dbUser.economy.balance) < amount) {
            return await interaction.reply({ content: `You do not have enough balance to make this payment.\nYou tried to pay ${TextParser.BigIntComma(amount)} coins, you have ${TextParser.BigIntComma(BigInt(dbUser.economy.balance))} coins.`, flags: [MessageFlags.Ephemeral] });
        }

        let dbTarget = await Database.getUser(target.id);

        let balance = dbUser.economy.balance;
        let targetBalance = dbTarget.economy.balance;

        dbUser.economy.balance = (BigInt(balance) - amount).toString();
        dbTarget.economy.balance = (BigInt(targetBalance) + amount).toString();

        await dbUser.save();
        await dbTarget.save();

        let Response = new ContainerBuilder();
        Response.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## :money_with_wings: Payment successful!
**${interaction.user.username}** has paid **${target.username}** ${TextParser.BigIntComma(amount)} coins.`))

        Response.addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`${TextParser.NumDiffBigInt(balance, dbUser.economy.balance)}`))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(interaction.user.displayAvatarURL({ size: 256 }))));
        
        Response.addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`${TextParser.NumDiffBigInt(targetBalance, dbTarget.economy.balance)}`))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(target.displayAvatarURL({ size: 256 }))));

        await interaction.reply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2]
        });
        Logger.info(`${interaction.user.id} paid ${target.id} ${TextParser.BigIntComma(amount)} coins.`);
    }
}