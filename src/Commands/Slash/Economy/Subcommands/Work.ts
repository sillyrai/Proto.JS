import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SectionBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Database from "../../../../Modules/Database";
import TextParser from "../../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("work")
        .setDescription("💸 Work to earn coins, 10 minute cooldown"),
                
    async execute(interaction: ChatInputCommandInteraction) {
        let dbUser = await Database.getUser(interaction.user.id);

        // Cooldown check
        const now = Date.now();
        if(now < dbUser.economy.cooldowns.work.getTime()) {
            let Response = new ContainerBuilder();
            Response.addSectionComponents(new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## :briefcase: Work!
You are on cooldown!
You can work again <t:${Math.floor(dbUser.economy.cooldowns.work.getTime() / 1000)}:R>`)
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
        let earnings = BigInt(Math.floor(Math.random() * 100) + 50); // Earn between 50 and 149 coins
        dbUser.economy.balance = `${BigInt(dbUser.economy.balance) + BigInt(earnings)}`;

        // Set new cooldown (10 minutes)
        dbUser.economy.cooldowns.work = new Date(now + TextParser.TimeStringParser("10m")!);
        await dbUser.save();

        // Response to user
        let Response = new ContainerBuilder();
        Response.addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## :briefcase: Work!
You worked hard and earned **${TextParser.BigIntComma(earnings)} coins**!

${TextParser.NumDiffBigInt(balance, dbUser.economy.balance)}`))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(interaction.user.displayAvatarURL({ size: 256})))
        );

        await interaction.reply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}