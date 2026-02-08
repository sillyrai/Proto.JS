import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, ContainerBuilder, FileUploadBuilder, LabelBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, ModalBuilder, SectionBuilder, SeparatorBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle, ThumbnailBuilder, User } from "discord.js";
import Database from "../../../../Modules/Database";
import type FursonaSchema from "../../../../Schemas/FursonaSchema";
import UserSchema from "../../../../Schemas/UserSchema";

function getFursonaDetailsContainer(owner:User, fursona:any, hideAvatar = false) {
    let Container = new ContainerBuilder();
    let Contents = `**Name**: ${fursona.name}\n**Species**: ${fursona.species || "N/A"}\n**Description**: ${fursona.description || "N/A"}\n**ID**: \`${fursona._id}\``

    if(hideAvatar) {
        Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(Contents));
    }
    else
    {
        Container.addSectionComponents(section => new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(Contents))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(owner.displayAvatarURL({ size: 512 })))
        )
    }
    
    if(fursona.imageUrls && fursona.imageUrls.length > 0) {
        Container.addSeparatorComponents(new SeparatorBuilder());
        let mediaGallery = new MediaGalleryBuilder();

        fursona.imageUrls.forEach((url:string) => {
            mediaGallery.addItems(new MediaGalleryItemBuilder()
                .setURL(url)
            )
        });
        Container.addMediaGalleryComponents(mediaGallery);
    }
    return Container;
}

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("view")
        .setDescription("🦊 View someones (or yours) fursona/original character")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user whose fursonas/original characters you want to view")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("oc_id")
                .setDescription("ID of OC you want to view, not required if you just want to see the list of OCs.")
                .setRequired(false)
                .setAutocomplete(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        let user = interaction.options.getUser("user") || interaction.user;

        let dbUser = await Database.getUser(user.id);

        // If an OC ID is provided, but no user we still try to fetch it
        let ocId = interaction.options.getString("oc_id");
        if(ocId && !interaction.options.getUser("user")) {
            try{
                let fursonaOwner = await UserSchema.findOne( { "fursonas._id": ocId }, { "fursonas.$": 1 } )
                if(!fursonaOwner || !fursonaOwner.fursonas || fursonaOwner.fursonas.length === 0) {
                    await interaction.reply({ content: "No fursona/original character found with that ID!", flags: [MessageFlags.Ephemeral] });
                    return;
                }
                let hideAvatar = fursonaOwner._id !== user.id; // Hide avatar if not the owner
                let detailsContainer = getFursonaDetailsContainer(user, fursonaOwner.fursonas[0], hideAvatar);
                await interaction.reply({ 
                    components: [detailsContainer],
                    flags: [MessageFlags.IsComponentsV2]
                });
                return;
            } catch (err) {
                console.error("Error fetching fursona by ID:", err);
                await interaction.reply({ content: "Invalid OC ID provided!", flags: [MessageFlags.Ephemeral] });
                return;
            }
        }


        if (!dbUser.fursonas || dbUser.fursonas.length === 0) {
            await interaction.reply({ content: `${user.id === interaction.user.id ? "You don't have any" : "That user doesn't have any"} fursonas/original characters to view!`, flags: [MessageFlags.Ephemeral] });
            return;
        }

        let Response = new ContainerBuilder();
        Response.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## :fox: ${user.username}'s Fursonas/Original Characters`))
        Response.addSeparatorComponents(new SeparatorBuilder());
        dbUser.fursonas.forEach((fursona) => {
            Response.addSectionComponents(section => new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Name**: ${fursona.name}\n**Species**: ${fursona.species || "N/A"}\n**ID**: \`${fursona._id}\``))
                .setButtonAccessory(new ButtonBuilder()
                    .setCustomId(`fursona.view.${fursona._id}`)
                    .setLabel("View Details")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("📋")
                )
            )
        })

        let resp = await interaction.reply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2],
            allowedMentions: { users: [] }
        });

        // Handle button interactions for viewing fursona details
        const collector = resp.createMessageComponentCollector({ componentType: ComponentType.Button, time: 5 * 60 * 1000 }); // 5 minutes
        collector.on("collect", async (i) => {
            if (!i.customId.startsWith("fursona.view.")) return;
            let fursonaId = i.customId.split(".")[2];
            let fursona = dbUser.fursonas.find(f => f._id.toString() === fursonaId);
            if (!fursona) {
                await i.reply({ content: "Fursona not found!", flags: [MessageFlags.Ephemeral] });
                return;
            }
            let detailsContainer = getFursonaDetailsContainer(user, fursona);
            await i.reply({ 
                components: [detailsContainer],
                flags: [MessageFlags.IsComponentsV2]
            });
        });
    }
}