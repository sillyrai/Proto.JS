import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import fs from "fs";
import Logger from "../../../../Modules/Logger";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("caption")
        .setDescription("🖼️ Add a meme-style caption to a user's avatar or uploaded image")
        .addStringOption(option =>
            option.setName("caption")
                .setDescription("The caption to add to the image")
                .setRequired(true))
        .addUserOption(option => 
            option.setName("user")
                .setDescription("The user to create a captioned image of")
                .setRequired(false))
        .addAttachmentOption(option => 
            option.setName("image")
                .setDescription("The image to create a captioned image of")
                .setRequired(false)),
                
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        let imageUrl: string | null = null;

        let attachment = interaction.options.getAttachment("image");
        let userOption = interaction.options.getUser("user");

        if(attachment) {
            imageUrl = attachment.url;
        } else if(userOption) {
            // Remove forceStatic to allow GIFs
            imageUrl = userOption.displayAvatarURL({ size: 512 });
        } else {
            // Remove forceStatic to allow GIFs
            imageUrl = interaction.user.displayAvatarURL({ size: 512 });
        }

        if(!imageUrl) {
            return interaction.editReply("Could not determine an image.");
        }

        Logger.debug(`Creating captioned image for ID ${interaction.id}`);

        let inputFilePath = `${__dirname}/temp/input_${interaction.id}`; 
        let isGif = false;

        try {
            const res = await fetch(imageUrl);
            if(!res.ok) {
                return interaction.editReply("Failed to fetch the image.");
            }

            let contentLength = res.headers.get("content-length");
            if(contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
                return interaction.editReply("The provided image is too large (max 10MB).");
            }

            // check content type for gif
            let contentType = res.headers.get("content-type");
            if(!contentType || !contentType.startsWith("image/")) {
                return interaction.editReply("The provided attachment is not an image.");
            }

            if (contentType.includes("gif") || imageUrl.endsWith(".gif")) {
                isGif = true;
                inputFilePath += ".gif";
            } else {
                inputFilePath += ".png";
            }

            let buffer = await res.arrayBuffer();
            fs.writeFileSync(inputFilePath, Buffer.from(buffer));
        } catch (e) {
            Logger.error(`Error downloading image: ${e}`);
            return interaction.editReply("An error occurred while downloading the image.");
        }

        let width = 0;
        try {
            // Use sharp to get metadata (works for first frame of gif too)
            // If sharp fails on animated gif, we might need another way, but usually it works.
            let metadata = await sharp(inputFilePath, { animated: true }).metadata();
            width = metadata.width!;
            
            // Double check if sharp detects it as animated (pages > 1) if we missed it
            if(metadata.pages && metadata.pages > 1 && !isGif) {
                 // It's actually a gif/animated webp but we saved as .png or treated as static?
                 // ffmpeg is robust, but filename extension helps.
                 // let's stick to our isGif detection from headers/url for now as it drives output format.
            }
        } catch (e) {
            Logger.error(`Error reading image metadata: ${e}`);
            if(fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
            return interaction.editReply("Invalid image format or unable to process.");
        }

        // Generate Text Caption using SVG & Sharp
        let caption = interaction.options.getString("caption", true);
        const height = Math.floor(width / 5); // Height is 20% of width
        const fontSize = Math.floor(width / 10); // Font size scales with width

        // Rough estimate for max characters per line
        const maxChars = Math.floor(width / (fontSize * 0.6));
        const words = caption.split(' ');
        let lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            if (currentLine.length + 1 + words[i].length <= maxChars) {
                currentLine += " " + words[i];
            } else {
                lines.push(currentLine);
                currentLine = words[i];
            }
        }
        lines.push(currentLine);

        // Adjust height for number of lines
        const lineHeight = fontSize * 1.2;
        const totalTextHeight = lines.length * lineHeight;
        const finalHeight = Math.max(height, totalTextHeight + (fontSize)); // Ensure enough padding

        let textElements = lines.map((line, index) => {
            const y = (finalHeight / 2) - (totalTextHeight / 2) + (index * lineHeight) + (fontSize / 2); // Vertically center the block
            return `<text x="50%" y="${y}" dominant-baseline="middle" text-anchor="middle" font-size="${fontSize}" fill="black" font-family="Arial, sans-serif" font-weight="bold">${line}</text>`;
        }).join("\n");

        let svgImage = `
        <svg width="${width}" height="${finalHeight}">
            <rect width="${width}" height="${finalHeight}" style="fill:white"/>
            ${textElements}
        </svg>
        `;
        
        const captionFilePath = `${__dirname}/temp/caption_${interaction.id}.png`;
        const outputFilePath = `${__dirname}/temp/output_${interaction.id}.${isGif ? 'gif' : 'png'}`;

        try {
            await sharp(Buffer.from(svgImage)).png().toFile(captionFilePath);

            // Use ffmpeg to overlay (stack)
            await new Promise<void>((resolve, reject) => {
                let command = ffmpeg();
                
                command.input(inputFilePath);
                command.input(captionFilePath);
                
                // Pad the video/image at the top, then overlay the caption
                // [0:v] is input (image/gif), [1:v] is caption
                command.complexFilter([
                    `[0:v]pad=width=iw:height=ih+${finalHeight}:x=0:y=${finalHeight}:color=white[padded]`,
                    `[padded][1:v]overlay=0:0`
                ]);

                if (isGif) {
                    command.outputOptions([
                        "-gifflags -offsetting"
                        // removed pix_fmt to let ffmpeg auto-select best for gif, unless proven otherwise like in Pet.ts
                    ]);
                }

                command.output(outputFilePath)
                    .on("end", () => resolve())
                    .on("error", (err) => reject(err))
                    .run();
            });

            await interaction.editReply({ 
                content: "Here is your captioned image:",
                files: [{ 
                    attachment: outputFilePath, 
                    name: `captioned.${isGif ? 'gif' : 'png'}` 
                }]
            });

        } catch (error) {
            Logger.error(`Error processing caption image: ${error}`);
            await interaction.editReply("An error occurred while processing the image.");
        } finally {
            // Cleanup
            if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
            if (fs.existsSync(captionFilePath)) fs.unlinkSync(captionFilePath);
            if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
        }
    }
}