import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ChannelType, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } from "discord.js";
import fs from "fs"
import Logger from "../../../../Modules/Logger";
import sharp from "sharp";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("caption")
        .setDescription("Add a meme-style caption to a user's avatar or uploaded image")
        .addStringOption(option =>
            option.setName("caption")
                .setDescription("The caption to add to the image")
                .setRequired(true))
        .addUserOption(option => 
            option.setName("user")
                .setDescription("The user to create a deepfried image of")
                .setRequired(false))
        .addAttachmentOption(option => 
            option.setName("image")
                .setDescription("The image to create a deepfried image of")
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

        // White bar at the top with black text
        let caption = interaction.options.getString("caption", true);
        const metadata = await image.metadata();
        const width = metadata.width!;
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
        let svgBuffer = Buffer.from(svgImage);

        let captionImage = sharp(svgBuffer).png();
        let captionMetadata = await captionImage.metadata();

        let imageMetadata = await image.metadata();
        let combinedHeight = (imageMetadata.height || 0) + (captionMetadata.height || 0);
        let combinedImage = sharp({
            create: {
                width: Math.max(imageMetadata.width || 0, captionMetadata.width || 0),
                height: combinedHeight,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        });
        combinedImage.composite([
            { input: await captionImage.toBuffer(), top: 0, left: 0 },
            { input: await image.toBuffer(), top: captionMetadata.height || 0, left: 0 }
        ]);
        await combinedImage.png().toFile(`${__dirname}/temp/output_${interaction.id}.png`);

        await interaction.editReply({ 
            content: "Here is your captioned image:",
            files: [{ attachment: `${__dirname}/temp/output_${interaction.id}.png`, name: `captioned_${interaction.id}.png` }]
        });
        // Clean up temp files
        fs.unlinkSync(`${__dirname}/temp/input_${interaction.id}.png`);
        fs.unlinkSync(`${__dirname}/temp/output_${interaction.id}.png`);
    }
}