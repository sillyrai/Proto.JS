import { ChatInputCommandInteraction, ContainerBuilder, LabelBuilder, ModalBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle, MessageFlags, FileUploadBuilder } from "discord.js";
import Database from "../../../../Modules/Database";
import FursonaSchema from "../../../../Schemas/FursonaSchema";
module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("add")
        .setDescription("🦊 Add a fursona/original character profile that other people can view"),

    async execute(interaction: ChatInputCommandInteraction) {
        let Modal = new ModalBuilder();
        Modal.setCustomId("fursona.add");
        Modal.setTitle("Add a fursona/original character");

        Modal.addLabelComponents(new LabelBuilder()
            .setLabel("Name")
            .setTextInputComponent(new TextInputBuilder()
                .setCustomId("fursona.name")
                .setPlaceholder("e.g. Fluffy the Fox")
                .setStyle(TextInputStyle.Short)
                .setMaxLength(64)
                .setRequired(true)
            )
        );

        Modal.addLabelComponents(new LabelBuilder()
            .setLabel("Species (optional)")
            .setTextInputComponent(new TextInputBuilder()
                .setCustomId("fursona.species")
                .setPlaceholder("e.g. Fox")
                .setStyle(TextInputStyle.Short)
                .setMaxLength(64)
                .setRequired(false)
            )
        );

        Modal.addLabelComponents(new LabelBuilder()
            .setLabel("Description (optional)")
            .setTextInputComponent(new TextInputBuilder()
                .setCustomId("fursona.description")
                .setPlaceholder("e.g. Fluffy is a friendly fox who loves to explore the forest.")
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(1024)
                .setRequired(false)
            )
        );

        Modal.addLabelComponents(new LabelBuilder()
            .setLabel("Artwork (optional)")
            .setFileUploadComponent(new FileUploadBuilder()
                .setCustomId("fursona.artwork")
                .setMaxValues(10)
                .setRequired(false)
            )
        );

        await interaction.showModal(Modal);

        // Handle response
        let filter = (i: any) => i.customId === "fursona.add" && i.user.id === interaction.user.id;
        // give them 30 minutes to fill out the form, since it might take a while if they yap for long
        let submitted = await interaction.awaitModalSubmit({ filter, time: 30 * 60 * 1000 }).catch(() => null);

        if (!submitted) {
            await interaction.followUp({ content: "You took too long to submit the form. Please try again.", ephemeral: true });
            return;
        }

        let name = submitted.fields.getTextInputValue("fursona.name");
        let species = submitted.fields.getTextInputValue("fursona.species");
        let description = submitted.fields.getTextInputValue("fursona.description");
        let artwork = submitted.fields.getUploadedFiles("fursona.artwork");

        // Save the fursona to the database
        let dbUser = await Database.getUser(interaction.user.id);
        if (!dbUser) {
            await interaction.followUp({ content: "An error occurred while saving your fursona. Please try again.", ephemeral: true });
            return;
        }

        dbUser.fursonas.push({
            name: name,
            species: species || null,
            description: description || null,
            imageUrls: artwork?.map(file => file.url) || []
        });
        await dbUser.save();

        let Response = new ContainerBuilder();
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`Your fursona "${name}" has been added!\nYou can view it using the \`/fursona view\` command.`));
        await submitted.reply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}