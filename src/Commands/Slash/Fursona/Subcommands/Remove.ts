import { ChatInputCommandInteraction, ContainerBuilder, FileUploadBuilder, LabelBuilder, MessageFlags, ModalBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Database from "../../../../Modules/Database";
import FursonaSchema from "../../../../Schemas/FursonaSchema";
module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("remove")
        .setDescription("🦊 Remove a fursona/original character from the database")
        .addStringOption(option =>
            option.setName("oc_id")
                .setDescription("The ID of the fursona/original character to remove")
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        let ocId = interaction.options.getString("oc_id", true);

        let dbUser = await Database.getUser(interaction.user.id);
        if (!dbUser.fursonas || dbUser.fursonas.length === 0) {
            await interaction.reply({ content: "You don't have any fursonas/original characters to remove!", flags: [MessageFlags.Ephemeral] });
            return;
        }

        let fursonaIndex = dbUser.fursonas.findIndex(f => f._id.toString() === ocId);
        if (fursonaIndex === -1) {
            await interaction.reply({ content: "No fursona/original character found with that ID!", flags: [MessageFlags.Ephemeral] });
            return;
        }

        let removedFursona = dbUser.fursonas.splice(fursonaIndex, 1)[0];
        await dbUser.save();

        let Response = new ContainerBuilder();
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`Your fursona "${removedFursona.name}" has been removed!`));
        await interaction.reply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}