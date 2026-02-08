import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } from "discord.js";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("help")
        .setDescription("🦊 Get help with fursona/original character commands"),

    async execute(interaction: ChatInputCommandInteraction) {
        let Container = new ContainerBuilder();
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 🦊 Fursona Help`));
        Container.addSeparatorComponents(new SeparatorBuilder());
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
`The fursona feature allows you to manage and view fursona or original character profiles.
This makes it easy to share your fursonas (or just original characters) with others and keep them organized in one place!

**Available Subcommands:**
- \`/fursona add\`: Opens a form to create a new fursona profile.
- \`/fursona view [user]\`: View your own or another user's fursonas.
- \`/fursona remove <character>\`: Remove one of your existing fursonas.

**Usage Example:**
1. \`/fursona add\` (Fill out the form)
2. \`/fursona view\` (View your own profiles)
3. \`/fursona view @User\` (View someone else's profiles)
4. \`/fursona remove\` (Then select the character to remove)`));
            
        await interaction.reply({ 
            components: [Container],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}