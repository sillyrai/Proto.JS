import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import fs from "fs";
import Logger from "../../../../Modules/Logger";
import sharp from "sharp";

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("blur")
        .setDescription("🌫️ Apply a blur effect to an image")
        .addStringOption(option => 
            option.setName("type")
                .setDescription("The type of blur to apply")
                .setRequired(true)
                .addChoices(
                    { name: 'Gaussian (Standard)', value: 'gaussian' },
                    { name: 'Median (Painting-like)', value: 'median' },
                    { name: 'Motion (Horizontal)', value: 'motion' },
                    { name: 'Pixelate (Censored)', value: 'pixelate' }
                ))
        .addIntegerOption(option => 
            option.setName("intensity")
                .setDescription("The intensity of the effect (1-100)")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option => 
            option.setName("user")
                .setDescription("The user to process (defaults to you)")
                .setRequired(false))
        .addAttachmentOption(option => 
            option.setName("image")
                .setDescription("A custom image to use instead of the avatar")
                .setRequired(false)),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const type = interaction.options.getString("type", true);
        const intensity = interaction.options.getInteger("intensity", true);
        const userOption = interaction.options.getUser("user");
        const attachmentOption = interaction.options.getAttachment("image");

        let imageUrl: string;
        
        if (attachmentOption) {
            imageUrl = attachmentOption.url;
            if (!attachmentOption.contentType?.startsWith('image/')) {
                return interaction.editReply("The attachment must be an image.");
            }
        } else {
            const targetUser = userOption || interaction.user;
            // Force static png to simplify processing (frames are complex)
            imageUrl = targetUser.displayAvatarURL({ extension: 'png', size: 1024, forceStatic: true });
        }

        const tempDir = `${__dirname}/temp`;
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const outputPath = `${tempDir}/blur_out_${interaction.id}.png`;

        try {
            const res = await fetch(imageUrl);
            if (!res.ok) {
                return interaction.editReply("Failed to download the image.");
            }
            
            const contentLength = res.headers.get("content-length");
            if(contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
                return interaction.editReply("The provided image is too large (max 10MB).");
            }

            const arrayBuffer = await res.arrayBuffer();
            const inputBuffer = Buffer.from(arrayBuffer);

            // sharp(inputBuffer) reads only the first frame of animations by default
            let pipeline = sharp(inputBuffer);

            switch (type) {
                case 'gaussian':
                    // Apply gaussian blur: sigma 0.3 to ~50
                    const sigma = 0.3 + (intensity / 100) * 49.7;
                    pipeline = pipeline.blur(sigma);
                    break;

                case 'median':
                    // Apply median filter: size 1 to ~31 (must be odd)
                    let mSize = Math.floor((intensity / 100) * 30) + 1;
                    if (mSize % 2 === 0) mSize += 1;
                    pipeline = pipeline.median(mSize);
                    break;

                case 'motion':
                    // Horizontal motion blur using convolution
                    let kSize = Math.floor((intensity / 100) * 50) + 1; 
                    if (kSize % 2 === 0) kSize += 1;
                    
                    // Sharp/libvips requires odd dimension square kernels for best compatibility
                    // so we create a kSize x kSize matrix with only the middle row active
                    const matrixSize = kSize * kSize;
                    const kernel = new Array(matrixSize).fill(0);
                    const middleRowStart = Math.floor(kSize / 2) * kSize;
                    
                    for (let i = 0; i < kSize; i++) {
                        kernel[middleRowStart + i] = 1 / kSize;
                    }

                    pipeline = pipeline.convolve({
                        width: kSize,
                        height: kSize,
                        kernel: kernel
                    });
                    break;

                case 'pixelate':
                    const metadata = await sharp(inputBuffer).metadata();
                    if (metadata.width) {
                        // Downscale then upscale with nearest neighbor
                        const factor = 1 + (intensity / 100) * 60; // Up to 60x reduction
                        const newWidth = Math.max(1, Math.floor(metadata.width / factor));
                        
                        // Force processing by writing to buffer to ensure data loss (pixelation)
                        // Sharp optimizes chained resizes (A -> B -> A) which can result in no-op if not forced
                        const downscaledBuffer = await sharp(inputBuffer)
                            .resize({ 
                                width: newWidth, 
                                kernel: 'nearest' 
                            })
                            .toBuffer();

                        pipeline = sharp(downscaledBuffer)
                            .resize({ 
                                width: metadata.width, 
                                kernel: 'nearest' 
                            });
                    }
                    break;
            }

            await pipeline.png().toFile(outputPath);

            await interaction.editReply({
                files: [{
                    attachment: outputPath,
                    name: `blur_${type}.png`
                }]
            });

        } catch (error) {
            Logger.error(`Error in blur command: ${error}`);
            await interaction.editReply("An error occurred while processing the image.");
        } finally {
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }
    }
}
