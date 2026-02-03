import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SectionBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Database from "../../../../Modules/Database";
import TextParser from "../../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("coinflip")
        .setDescription("Flip a coin to win or lose coins")
        .addStringOption(option => 
            option.setName("choice")
                .setDescription("Choose heads or tails")
                .setRequired(true)
                .addChoices(
                    { name: "heads", value: "heads" },
                    { name: "tails", value: "tails" },
                    { name: "side", value: "side" }
                ))
        .addStringOption(option => 
            option.setName("bet")
                .setDescription("Amount of coins to bet (e.g., 100, 5k)")
                .setRequired(true)),
                
                
    async execute(interaction: ChatInputCommandInteraction) {
        let dbUser = await Database.getUser(interaction.user.id);
        let choice = interaction.options.getString("choice", true);
        let betInput = interaction.options.getString("bet", true);

        // Parse bet amount
        let betAmount = TextParser.SuffixNumber(betInput);
        if(!betAmount)
            return interaction.reply({ content: "Invalid bet amount. Please enter a valid number (e.g., 100, 5k).", flags: [MessageFlags.Ephemeral] });
        if(BigInt(betAmount) > BigInt(dbUser.economy.balance))
            return interaction.reply({ content: "You do not have enough coins to make that bet.", flags: [MessageFlags.Ephemeral] });

        // Flip the coin, side is 0.1% chance
        let outcomes = ["heads", "tails", "side"];
        let randomNum = Math.random();
        let result: string;
        if(randomNum <= 0.001) {
            result = "side";
        } else if(randomNum <= 0.5005) {
            result = "heads";
        } else {
            result = "tails";
        }

        let balance = dbUser.economy.balance;
        let Response = new ContainerBuilder();
        if(choice === result) {
            // User wins
            dbUser.economy.balance = `${BigInt(dbUser.economy.balance) + BigInt(betAmount)}`;
            await dbUser.save();
            Response.addSectionComponents(new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## :coin: Coin Flip!
You chose **${choice}** and the coin landed on **${result}**.
You won **${TextParser.BigIntComma(betAmount)} coins**!
${TextParser.NumDiffBigInt(balance, dbUser.economy.balance)}`))
                .setThumbnailAccessory(new ThumbnailBuilder().setURL(interaction.user.displayAvatarURL({ size: 256})))
            );
        } else {
            // User loses
            dbUser.economy.balance = `${BigInt(dbUser.economy.balance) - BigInt(betAmount)}`;
            await dbUser.save();
            Response.addSectionComponents(new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## :coin: Coin Flip!
You chose **${choice}** and the coin landed on **${result}**.
You lost **${TextParser.BigIntComma(betAmount)} coins**.
${TextParser.NumDiffBigInt(balance, dbUser.economy.balance)}`))
                .setThumbnailAccessory(new ThumbnailBuilder().setURL(interaction.user.displayAvatarURL({ size: 256})))
            );
        }

        await interaction.reply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}