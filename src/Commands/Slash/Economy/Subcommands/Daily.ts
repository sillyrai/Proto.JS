import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SectionBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Database from "../../../../Modules/Database";
import TextParser from "../../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("daily")
        .setDescription("Get your daily coins, 24 hour cooldown"),
                  
    async execute(interaction: ChatInputCommandInteraction) {
        let dbUser = await Database.getUser(interaction.user.id);

        // Cooldown check
        const now = Date.now();
        if(now < dbUser.economy.cooldowns.daily.getTime()) {
            let Response = new ContainerBuilder();
            Response.addSectionComponents(new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## :sun: Daily!
You are on cooldown!
You can get your daily again <t:${Math.floor(dbUser.economy.cooldowns.daily.getTime() / 1000)}:R>`)
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
        let earnings = 250n; // Fixed 250 coins for daily
        dbUser.economy.balance = `${BigInt(dbUser.economy.balance) + BigInt(earnings)}`;

        // Set new cooldown (24 hours)
        dbUser.economy.cooldowns.daily = new Date(now + TextParser.TimeStringParser("24h")!);
        await dbUser.save();

        // Response to user
        let Response = new ContainerBuilder();
        Response.addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## :sun: Daily!
You received your daily reward of **${TextParser.BigIntComma(earnings)} coins**!

${TextParser.NumDiffBigInt(balance, dbUser.economy.balance)}`))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(interaction.user.displayAvatarURL({ size: 256})))
        );

        await interaction.reply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}