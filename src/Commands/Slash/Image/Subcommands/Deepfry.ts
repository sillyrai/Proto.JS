import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ChannelType, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } from "discord.js";
import fs from "fs"
import Logger from "../../../../Modules/Logger";
import sharp from "sharp";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("deepfry")
        .setDescription("🖼️ ts frying me bro | Create a deepfried image from a user's avatar or uploaded image")
        .addUserOption(option => 
            option.setName("user")
                .setDescription("The user to create a deepfried image of")
                .setRequired(false))
        .addAttachmentOption(option => 
            option.setName("image")
                .setDescription("The image to create a deepfried image of")
                .setRequired(false))
        .addStringOption(option =>
            option.setName("intensity")
                .setDescription("The intensity of the deepfry effect (low, medium, high)")
                .setRequired(false)
                .addChoices(
                    { name: "low", value: "low" },
                    { name: "medium", value: "medium" },
                    { name: "high", value: "high" }
                )),
                
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        let imageUrl: string | null = null;

        let attachment = interaction.options.getAttachment("image");
        let userOption = interaction.options.getUser("user");

        if(attachment) {
            imageUrl = attachment.url;
        } else if(userOption) {
            let userAvatarUrl = userOption.displayAvatarURL({ extension: "png", size: 256, forceStatic: true });
            imageUrl = userAvatarUrl;
        } else {
            imageUrl = interaction.user.displayAvatarURL({ extension: "png", size: 256, forceStatic: true });
        }

        if(!imageUrl) {
            return interaction.editReply("Could not determine an image to create a deepfried image of.");
        }

        Logger.debug(`Creating deepfried image for image URL: ${imageUrl}`);

        await fetch(imageUrl).then(async res =>  {
            if(!res.ok) await interaction.editReply("Failed to fetch the image.");
            // if file is 10+MB, reject
            let contentLength = res.headers.get("content-length");
            if(contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
                return interaction.editReply("The provided image is too large (max 10MB).");
            }
            // if not image content-type, reject
            let contentType = res.headers.get("content-type");
            if(!contentType || !contentType.startsWith("image/")) {
                return interaction.editReply("The provided attachment is not an image.");
            }

            let buffer = await res.arrayBuffer();
            fs.writeFileSync(`${__dirname}/temp/input_${interaction.id}.png`, Buffer.from(buffer));
        })

        let image = sharp(`${__dirname}/temp/input_${interaction.id}.png`);

        let intensity = interaction.options.getString("intensity") || "medium";

        let quality: number;
        let saturation: number;
        let contrast: number;
        switch(intensity) {
            case "low":
                quality = 70;
                saturation = 1.5;
                contrast = 1.2;
                break;
            case "medium":
                quality = 50;
                saturation = 2;
                contrast = 1.5;
                break;
            case "high":
                quality = 30;
                saturation = 3;
                contrast = 2;
                break;
            default:
                quality = 50;
                saturation = 2;
                contrast = 1.5;
        }

        image
            .modulate({
                saturation: saturation,
                brightness: 1.1
            })
            .linear(contrast, -(128 * (contrast - 1)))
            .jpeg({ quality: quality })
            .toFile(`${__dirname}/temp/deepfried_${interaction.id}.jpg`)
            .then(async () => {
                await interaction.editReply({ 
                    files: [{
                        attachment: `${__dirname}/temp/deepfried_${interaction.id}.jpg`,
                        name: "deepfried.jpg"
                    }]
                });
                // cleanup
                fs.unlinkSync(`${__dirname}/temp/input_${interaction.id}.png`);
                fs.unlinkSync(`${__dirname}/temp/deepfried_${interaction.id}.jpg`);
            }
        ).catch(async (err) => {
            Logger.error(`Error creating deepfried image: ${err.message}`);
            await interaction.editReply("An error occurred while creating the deepfried image.");
            // cleanup
            if(fs.existsSync(`${__dirname}/temp/input_${interaction.id}.png`)) {
                fs.unlinkSync(`${__dirname}/temp/input_${interaction.id}.png`);
            }
        });
    }
}