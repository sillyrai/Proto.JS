import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ChannelType, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } from "discord.js";
import Database from "../../../../Modules/Database";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("help")
        .setDescription("Displays help information for the starboard commands"),
                
    async execute(interaction: ChatInputCommandInteraction) {
        let Container = new ContainerBuilder();
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ⭐ Starboard Help`));
        Container.addSeparatorComponents(new SeparatorBuilder());
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
`The starboard feature allows you to highlight popular messages in your server by reposting them in a designated starboard channel when they receive a certain number of star reactions.
**Available Subcommands:**
- \`/starboard channel <#channel>\`: Sets the starboard channel where starred messages will be posted.
- \`/starboard threshold <number>\`: Sets the number of star reactions required for a message to be posted to the starboard.
- \`/starboard enabled <true|false>\`: Enables or disables the starboard feature.
- \`/starboard emoji <emoji>\`: Sets the emoji used for starring messages (default is ⭐).
**Usage Example:**
To set up the starboard, use the following commands:
1. \`/starboard channel #starboard-channel\`
2. \`/starboard threshold 5\`
3. \`/starboard enabled true\`
4. \`/starboard emoji ⭐\`
Once configured, messages that receive the specified number of star reactions will be automatically posted to the starboard channel.`));
        await interaction.reply({ 
            components: [Container],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}