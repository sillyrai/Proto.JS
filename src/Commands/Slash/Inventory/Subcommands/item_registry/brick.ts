import { ChatInputCommandInteraction, ContainerBuilder, LabelBuilder, MessageFlags, ModalBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

module.exports = {
    async execute(interaction: ChatInputCommandInteraction, item: any, dbUser: any) {
        // Logic for using the brick item

        // Prompt what user to throw the brick at
        let Modal = new ModalBuilder();
        Modal.setTitle("Throw Brick");
        Modal.setCustomId(`throw_brick`);

        Modal.setLabelComponents(new LabelBuilder()
            .setLabel("Username").setTextInputComponent(new TextInputBuilder()
                .setCustomId("target_user")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Name of target, doesn't have to be a user")
            )
        );

        await interaction.showModal(Modal);

        await interaction.awaitModalSubmit({ time: 60000 }).then(async i => {
            if(i.user.id !== interaction.user.id) {
                return i.reply({ content: "You cannot interact with this modal." });
            }
            if(i.customId === "throw_brick") {
                let targetUser = i.fields.getTextInputValue("target_user");
                let Response = new ContainerBuilder();
                Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`🧱 You threw a brick at **${targetUser}**!`));
                await i.reply({ 
                    components: [Response], 
                    flags: [MessageFlags.IsComponentsV2],
                    allowedMentions: { parse: [] }
                });
            };
        });
    }
}