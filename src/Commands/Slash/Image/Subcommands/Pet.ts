import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ChannelType, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } from "discord.js";
import Database from "../../../../Modules/Database";
import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import Logger from "../../../../Modules/Logger";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("pet")
        .setDescription("🖼️ Create a petpet gif from a user's avatar or uploaded image")
        .addUserOption(option => 
            option.setName("user")
                .setDescription("The user to create a petpet gif of")
                .setRequired(false))
        .addAttachmentOption(option => 
            option.setName("image")
                .setDescription("The image to create a petpet gif of")
                .setRequired(false)),
                
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
            return interaction.editReply("Could not determine an image to create a petpet gif of.");
        }

        Logger.debug(`Creating petpet gif for image URL: ${imageUrl}`);

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

        
        ffmpeg.ffprobe(`${__dirname}/temp/input_${interaction.id}.png`, (err, metadata) => {
            if (err) {
                Logger.error(`Error probing image: ${err.message}`);
                interaction.editReply("An error occurred while processing the image.");
                return;
            }
            
            const width = metadata.streams[0].width;
            const height = metadata.streams[0].height;
            
            ffmpeg()
                .input(`${__dirname}/temp/input_${interaction.id}.png`)
                .input(`${__dirname}/assets/petpet.gif`)
                .complexFilter([
                    `[1:v]scale=${width}:${height}:force_original_aspect_ratio=disable[scaled]`,
                    '[0:v][scaled]overlay=0:0'
                ])
                .output(`${__dirname}/temp/petpet_${interaction.id}.gif`)
                .on("end", async () => {
                    await interaction.editReply({ 
                        files: [{
                            attachment: `${__dirname}/temp/petpet_${interaction.id}.gif`,
                            name: "petpet.gif"
                        }]
                    });
                    // cleanup
                    fs.unlinkSync(`${__dirname}/temp/input_${interaction.id}.png`);
                    fs.unlinkSync(`${__dirname}/temp/petpet_${interaction.id}.gif`);
                })
                .on("error", async (err) => {
                    Logger.error(`Error creating petpet gif: ${err.message}`);
                    await interaction.editReply("An error occurred while creating the petpet gif.");
                    // cleanup
                    if(fs.existsSync(`${__dirname}/temp/input_${interaction.id}.png`)) {
                        fs.unlinkSync(`${__dirname}/temp/input_${interaction.id}.png`);
                    }
                })
                .outputOptions([
                    "-gifflags -offsetting",
                    "-pix_fmt yuv420p"
                ])
                .run();
        });
    }
}