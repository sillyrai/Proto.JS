import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SectionBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Database from "../../../../Modules/Database";
import TextParser from "../../../../Modules/TextParser";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("balance")
        .setDescription("Displays a user's balance")
        .addUserOption(option => 
            option.setName("target")
                .setDescription("The user to check the balance of")
                .setRequired(false)),
                
                
    async execute(interaction: ChatInputCommandInteraction) {
        const target = interaction.options.getUser("target") || interaction.user;

        let dbUser = await Database.getUser(target.id);
        let Balance = dbUser.economy.balance;

        let Response = new ContainerBuilder();
        Response.addSectionComponents(new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## :moneybag: Balance
**${target.username}** has a balance of **${TextParser.BigIntComma(Balance)}** coins.`))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(target.displayAvatarURL({ size: 256 }))));

        await interaction.reply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}