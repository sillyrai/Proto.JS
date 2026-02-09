import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder } from "discord.js";
import Database from "../../../Modules/Database";
module.exports = {
    data: new SlashCommandBuilder()
        .setName("effects")
        .setDescription("🔍 View someones currently active status effects!")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to view effects for")
                .setRequired(false))
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ])
        .setIntegrationTypes([
            ApplicationIntegrationType.GuildInstall,
            ApplicationIntegrationType.UserInstall
        ]),

    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user") || interaction.user;

        let Response = new ContainerBuilder();
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 🔍 Active Status Effects for ${user.tag}`));

        let dbUser = await Database.getUser(user.id);
        let atLeastOne = false;
        // for each effect
        for(let effect of dbUser.statusEffects){
            if(effect.expiresAt > new Date()){
                atLeastOne = true;
                Response.addSeparatorComponents(new SeparatorBuilder());
                let dbEffect = await Database.getStatusEffect(effect._id);
                Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${dbEffect?.name || effect._id} (Intensity: ${effect.intensity})\n${dbEffect?.description || "No Description"}\n*Expires <t:${Math.floor(new Date(effect.expiresAt).getTime() / 1000)}:R>*`));
            }
        }
        if(!atLeastOne) Response.addTextDisplayComponents(new TextDisplayBuilder().setContent("This user has no active status effects!"));

        await interaction.reply({ 
            components: [Response], 
            flags: [MessageFlags.IsComponentsV2] 
        });
    }
}