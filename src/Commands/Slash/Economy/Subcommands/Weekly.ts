import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SectionBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Database from "../../../../Modules/Database";
import TextParser from "../../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("weekly")
        .setDescription("💸 Get your weekly coins, 7 day cooldown"),
                
                
    async execute(interaction: ChatInputCommandInteraction) {
        let dbUser = await Database.getUser(interaction.user.id);

        // Cooldown check
        const now = Date.now();
        if(now < dbUser.economy.cooldowns.weekly.getTime()) {
            let Response = new ContainerBuilder();
            Response.addSectionComponents(new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## :sun: Weekly!
You are on cooldown!
You can get your weekly again <t:${Math.floor(dbUser.economy.cooldowns.weekly.getTime() / 1000)}:R>`)
                )
                .setThumbnailAccessory(new ThumbnailBuilder().setURL(interaction.user.displayAvatarURL({ size: 256})))
            );
            return await interaction.reply({ 
                components: [Response],
                flags: [MessageFlags.IsComponentsV2]
            });
        }
        let balance = dbUser.economy.balance;

        // Calculate earnings
        let earnings = 1000n; // Fixed 1000 coins for weekly
        dbUser.economy.balance = `${BigInt(dbUser.economy.balance) + BigInt(earnings)}`;

        // Set new cooldown (7 days)
        dbUser.economy.cooldowns.weekly = new Date(now + TextParser.TimeStringParser("7d")!);
        await dbUser.save();

        // Response to user
        let Response = new ContainerBuilder();
        Response.addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## :sun: Weekly!
You received your weekly reward of **${TextParser.BigIntComma(earnings)} coins**!

${TextParser.NumDiffBigInt(balance, dbUser.economy.balance)}`))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(interaction.user.displayAvatarURL({ size: 256})))
        );

        await interaction.reply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}