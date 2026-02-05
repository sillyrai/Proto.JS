import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import fs from "fs";
import Logger from "../../../../Modules/Logger";
import sharp from "sharp";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("quote")
        .setDescription("💬 Create an inspirational quote image from a user or image")
        .addStringOption(option => 
            option.setName("text")
                .setDescription("The quote text")
                .setRequired(true))
        .addUserOption(option => 
            option.setName("user")
                .setDescription("The user to quote (defaults to you)")
                .setRequired(false))
        .addAttachmentOption(option => 
            option.setName("image")
                .setDescription("A custom image to use instead of the avatar")
                .setRequired(false)),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        // 1. Resolve inputs
        const text = interaction.options.getString("text", true);
        const userOption = interaction.options.getUser("user");
        const attachmentOption = interaction.options.getAttachment("image");
        
        // Target user for name/avatar fallback
        const targetUser = userOption || interaction.user;
        const displayName = targetUser.displayName;

        // Determine Image URL
        let imageUrl = targetUser.displayAvatarURL({ extension: 'png', size: 1024 });
        if (attachmentOption) {
            imageUrl = attachmentOption.url;
            // Basic validation
            if (!attachmentOption.contentType?.startsWith('image/')) {
                return interaction.editReply("The attachment must be an image.");
            }
        }

        const tempDir = `${__dirname}/temp`;
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        // const inputPath = `${tempDir}/quote_in_${interaction.id}.png`;
        const outputPath = `${tempDir}/quote_out_${interaction.id}.png`;

        try {
            // 2. Download Image
            const res = await fetch(imageUrl);
            if (!res.ok) {
                return interaction.editReply("Failed to download the image.");
            }
            const arrayBuffer = await res.arrayBuffer();
            const inputBuffer = Buffer.from(arrayBuffer);
            
            // Constants
            const canvasWidth = 1200;
            const canvasHeight = 600;
            const imageContainerWidth = canvasWidth / 2 + 100; // Extend slightly past center for blending

            // 3. Process Input Image (left side)
            // Resize to cover the left half(ish), vertical center, grayscale
            const processedImageBuffer = await sharp(inputBuffer)
                .resize({
                    width: imageContainerWidth,
                    height: canvasHeight,
                    fit: 'cover',
                    position: 'center'
                })
                .grayscale() 
                .toBuffer();

            // 4. Create Gradient Overlay (Transparent -> Black)
            // This ensures smooth transition from image to black background
            // We make the gradient go from Transparent (left) to Black (right)
            // But strict left-to-right might be too simple, let's do a gradient that starts halfway
            const gradientSvg = `
            <svg width="${imageContainerWidth}" height="${canvasHeight}">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:black;stop-opacity:0" />
                        <stop offset="40%" style="stop-color:black;stop-opacity:0" />
                        <stop offset="90%" style="stop-color:black;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:black;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grad)" />
            </svg>`;
            const gradientBuffer = await sharp(Buffer.from(gradientSvg)).png().toBuffer();

            // 5. Generate Text Block (right side)
            // Right side is implicitly x=600 to 1200
            const textAreaWidth = canvasWidth / 2;
            const fontSize = 48;
            const maxCharsPerLine = 20; // Approximate for this font size/width
            
            // Basic word wrap
            const words = text.split(" ");
            let lines: string[] = [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                if ((currentLine + " " + words[i]).length <= maxCharsPerLine) {
                    currentLine += " " + words[i];
                } else {
                    lines.push(currentLine);
                    currentLine = words[i];
                }
            }
            lines.push(currentLine);

            const lineHeight = fontSize * 1.4;
            const totalTextHeight = lines.length * lineHeight;
            
            // SVG Text Generation
            // Centered vertically in the text area
            const startY = (canvasHeight - totalTextHeight) / 2;
            
            const textElements = lines.map((line, idx) => {
                const y = startY + (idx * lineHeight) + (lineHeight / 2); // Center baseline
                return `<text x="50%" y="${y}" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="${fontSize}">${line}</text>`;
            }).join("");

            // Signature
            const signatureY = startY + totalTextHeight + 60;
            const signatureElement = `<text x="50%" y="${signatureY}" dominant-baseline="middle" text-anchor="middle" fill="#aaaaaa" font-family="Arial, sans-serif" font-size="${fontSize * 0.6}">- ${displayName}</text>`;

            const fullTextSvg = `
            <svg width="${textAreaWidth}" height="${canvasHeight}">
                ${textElements}
                ${signatureElement}
            </svg>
            `;
            const textBuffer = await sharp(Buffer.from(fullTextSvg)).png().toBuffer();

            // 6. Composition
            await sharp({
                create: {
                    width: canvasWidth,
                    height: canvasHeight,
                    channels: 4,
                    background: { r: 0, g: 0, b: 0, alpha: 1 } // Black background
                }
            })
            .composite([
                // Layer 1: The user image on the left
                { input: processedImageBuffer, left: 0, top: 0 },
                // Layer 2: The gradient overlay on top of the image to fade it out
                { input: gradientBuffer, left: 0, top: 0 },
                // Layer 3: The text on the right half
                { input: textBuffer, left: textAreaWidth, top: 0 }
            ])
            .png()
            .toFile(outputPath);

            // 7. Send
            await interaction.editReply({
                files: [{
                    attachment: outputPath,
                    name: "quote.png"
                }]
            });

        } catch (error) {
            Logger.error(`Error in quote command: ${error}`);
            await interaction.editReply("An error occurred while generating the quote.");
        } finally {
            // Cleanup
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }
    }
}
