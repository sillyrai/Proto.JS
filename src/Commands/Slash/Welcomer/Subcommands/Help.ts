import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } from "discord.js";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("help")
        .setDescription("👋 Displays help information for the welcomer commands"),
                
    async execute(interaction: ChatInputCommandInteraction) {
        let Container = new ContainerBuilder();
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 🎉 Welcomer Help`));
        Container.addSeparatorComponents(new SeparatorBuilder());
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
`The welcomer feature allows you to greet new members when they join or leave your server.
**Available Subcommands:**
- \`/welcomer channel <#channel>\`: Sets the channel where welcome/leave messages will be posted.
- \`/welcomer enabled <true|false>\`: Enables or disables the welcomer feature.
- \`/welcomer message <type> <message>\`: Sets the message for **join** or **leave** events.

**Message Variables:**
You can use the following variables in your messages:
- \`{user.username}\`: The username of the user
- \`{user.mention}\`: Mentions the user
- \`{user.displayName}\`: The display name of the user
- \`{user.id}\`: The ID of the user
- \`{guild.name}\`: The name of the server
- \`{guild.memberCount}\`: The member count of the server
- \`{guild.id}\`: The ID of the server

**Usage Example:**
1. \`/welcomer channel #welcome\`
2. \`/welcomer enabled true\`
3. \`/welcomer message type:join message:Welcome {user.mention} to {guild.name}! You are member #{guild.memberCount}.\`
4. \`/welcomer message type:leave message:Goodbye {user.username}, we will miss you!\``));
        await interaction.reply({ 
            components: [Container],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}