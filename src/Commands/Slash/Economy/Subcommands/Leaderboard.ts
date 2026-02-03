import { ChatInputCommandInteraction, ContainerBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
import Database from "../../../../Modules/Database";
import TextParser from "../../../../Modules/TextParser";
import UserSchema from "../../../../Schemas/UserSchema";


module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("leaderboard")
        .setDescription("View the economy leaderboard (global)"),
                
    async execute(interaction: ChatInputCommandInteraction) {

        // Balance is stored as string to support BigInt, so we need to convert it back
        // sort by length first, then by the string value to simulate numeric sort on strings
        let top10users = await UserSchema.aggregate([
            {
                $addFields: {balanceLength: { $strLenCP: "$economy.balance" }}
            },
            {
                $sort: {
                    balanceLength: -1,
                    "economy.balance": -1
                }
            },
            {
                $limit: 10
            }
        ]);
        
        let LeaderboardDisplay = new ContainerBuilder();

        let FullText = ""
        LeaderboardDisplay.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## :trophy: Economy Leaderboard`));
        LeaderboardDisplay.addSeparatorComponents(new SeparatorBuilder());
        for(let i = 0; i < top10users.length; i++) {
            let userData = top10users[i];
            let user = await interaction.client.users.fetch(userData._id).catch(() => null);
            let balance = BigInt(userData.economy.balance);
            let displayName = user ? user.username : "Unknown User";
            FullText += `\n**${i + 1}.**  @${TextParser.EscapeSymbols(displayName)} - **${TextParser.SizeSuffix(balance)}** coins`;
        }
        LeaderboardDisplay.addTextDisplayComponents(new TextDisplayBuilder().setContent(FullText.trim()));

        await interaction.reply({ 
            components: [LeaderboardDisplay], 
            flags: [MessageFlags.IsComponentsV2] 
        });
    }
}