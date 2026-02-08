import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import fs from "fs";
import Logger from "../../../../Modules/Logger";
import sharp from "sharp";

const BASE_WIDTH = 1277;
const BASE_HEIGHT = 369;
const MAX_WIDTH = 2500;
const CONTENT_X = 391;
const CONTENT_Y = 272.435;
const LINE_HEIGHT = 110;
const RIGHT_PADDING = 60;
const FONT_SIZE = 95;

function escapeXml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function estimateTextWidth(value: string, fontSize: number) {
    let width = 0;
    for (const char of value) {
        if (char === " ") {
            width += fontSize * 0.28;
        } else if ("ilI.,:;'|!".includes(char)) {
            width += fontSize * 0.25;
        } else if ("mwMW@#%".includes(char)) {
            width += fontSize * 0.85;
        } else if ("ABCDEFGHJKLMNOPQRSTUVWXYZ".includes(char)) {
            width += fontSize * 0.7;
        } else {
            width += fontSize * 0.56;
        }
    }
    return width;
}

function wrapText(value: string, maxWidth: number, fontSize: number) {
    const lines: string[] = [];
    const paragraphs = value.split(/\r?\n/);

    for (const paragraph of paragraphs) {
        if (paragraph.trim() === "") {
            lines.push("");
            continue;
        }

        const words = paragraph.split(/\s+/).filter(Boolean);
        let line = "";

        for (const word of words) {
            const candidate = line ? `${line} ${word}` : word;
            if (estimateTextWidth(candidate, fontSize) <= maxWidth) {
                line = candidate;
                continue;
            }

            if (line) {
                lines.push(line);
                line = "";
            }

            if (estimateTextWidth(word, fontSize) <= maxWidth) {
                line = word;
                continue;
            }

            let chunk = "";
            for (const char of word) {
                const chunkCandidate = chunk + char;
                if (estimateTextWidth(chunkCandidate, fontSize) > maxWidth) {
                    if (chunk) lines.push(chunk);
                    chunk = char;
                } else {
                    chunk = chunkCandidate;
                }
            }

            if (chunk) {
                line = chunk;
            }
        }

        if (line) lines.push(line);
    }

    return lines.length ? lines : [""];
}

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("discord")
        .setDescription("🖼️ Create a fake Discord message image from text and a user/avatar")
        .addUserOption(option => 
            option.setName("user")
                .setDescription("The user to attribute the message to")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("content")
                .setDescription("The message content to display")
                .setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser("user", true);
        const content = interaction.options.getString("content", true);

        const tempDir = `${__dirname}/temp`;
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const outputPath = `${tempDir}/discord_message_${interaction.id}.png`;

        try {
            const avatarUrl = targetUser.displayAvatarURL({ extension: 'png', size: 512 });
            const res = await fetch(avatarUrl);
            if (!res.ok) {
                return interaction.editReply("Failed to download the user's avatar.");
            }
            const arrayBuffer = await res.arrayBuffer();
            const avatarBuffer = Buffer.from(arrayBuffer);
            // Load SVG template and replace placeholders
            let svgTemplate = fs.readFileSync(`${__dirname}/assets/DiscordMessage.svg`, "utf-8");
            const avatarBase64 = `data:image/png;base64,${avatarBuffer.toString("base64")}`;
            const maxContentWidthBase = BASE_WIDTH - CONTENT_X - RIGHT_PADDING;
            const maxContentWidthCap = MAX_WIDTH - CONTENT_X - RIGHT_PADDING;
            const singleLineWidth = estimateTextWidth(content, FONT_SIZE);
            let svgWidth = BASE_WIDTH;
            let contentLines: string[] = [];

            if (!content.includes("\n") && singleLineWidth > maxContentWidthBase && singleLineWidth <= maxContentWidthCap) {
                svgWidth = Math.max(BASE_WIDTH, Math.ceil(CONTENT_X + RIGHT_PADDING + singleLineWidth));
                contentLines = [content];
            } else {
                if (singleLineWidth > maxContentWidthBase) {
                    svgWidth = Math.max(BASE_WIDTH, MAX_WIDTH);
                }
                const maxContentWidth = singleLineWidth > maxContentWidthBase ? maxContentWidthCap : maxContentWidthBase;
                contentLines = wrapText(content, maxContentWidth, FONT_SIZE);
            }

            const svgHeight = BASE_HEIGHT + Math.max(0, contentLines.length - 1) * LINE_HEIGHT;
            const contentTspans = contentLines
                .map((line, index) => {
                    const positionAttr = index === 0 ? `y="${CONTENT_Y}"` : `dy="${LINE_HEIGHT}"`;
                    return `<tspan x="${CONTENT_X}" ${positionAttr}>${escapeXml(line)}</tspan>`;
                })
                .join("");

            svgTemplate = svgTemplate.replace(/\[WIDTH\]/g, svgWidth.toString());
            svgTemplate = svgTemplate.replace(/\[HEIGHT\]/g, svgHeight.toString());
            svgTemplate = svgTemplate.replace("[IMAGE_BYTES]", avatarBase64);
            svgTemplate = svgTemplate.replace("[USERNAME]", escapeXml(targetUser.displayName || targetUser.username));
            const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            svgTemplate = svgTemplate.replace("[TIME]", escapeXml(timestamp));
            svgTemplate = svgTemplate.replace("[CONTENT_TSPANS]", contentTspans);

            // Convert SVG to PNG using sharp
            await sharp(Buffer.from(svgTemplate))
                .png()
                .toFile(outputPath);

            await interaction.editReply({ files: [outputPath] });
        } catch (error) {
            Logger.error("Error creating Discord message image:"+error);
            await interaction.editReply("An error occurred while creating the Discord message image.");
        } finally {
            // Clean up temp file after a short delay to ensure it's sent
            if(fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
        }
    }
}
