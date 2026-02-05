import { Client, ChatInputCommandInteraction, Interaction, Events, Collection, SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, ActionRow, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import fs from 'fs';
import path from 'path';
import Logger from '../Modules/Logger';
import chalk from 'chalk';
// Define the command interface
interface SlashCommand {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export default function(client: Client) {
    const commands = new Collection<string, SlashCommand>();
    const slashCommandsDir = path.join(__dirname, '../Commands/Slash');

    function getCommandFiles(dir: string): string[] {
        let files: string[] = [];
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                if (item.name.toLowerCase() === 'subcommands') continue;
                files = files.concat(getCommandFiles(fullPath));
            } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.js'))) {
                files.push(fullPath);
            }
        }
        return files;
    }

    if (!fs.existsSync(slashCommandsDir)) {
        console.warn(`[WARNING] Commands directory not found at: ${slashCommandsDir}`);
        return;
    }

    const commandFiles = getCommandFiles(slashCommandsDir);

    for (const file of commandFiles) {
        try {
            const filePath = path.resolve(file);
            delete require.cache[require.resolve(filePath)];
            const commandModule = require(filePath);
            const command = commandModule.default || commandModule;

            if ('data' in command && 'execute' in command) {
                commands.set(command.data.name, command);
                Logger.info(`Loaded slash command: ${chalk.yellow("/"+command.data.name)}`);
            } else {
                Logger.warn(`The command at ${file} is missing a required "data" or "execute" property.`);
            }
        } catch (error) {
            Logger.error(`Failed to load command at ${file}: ${error}`);
        }
    }

    (client as any).commands = commands;

    client.on(Events.InteractionCreate, async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = commands.get(interaction.commandName);
        if (!command) {
            Logger.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
            let args = interaction.options.data.map(option => `${chalk.green(option.name)}:${chalk.greenBright(option.value)}`).join(", ");
            if (interaction.options.getSubcommand(false)) {
                args = `${chalk.yellow(interaction.options.getSubcommand())} ${interaction.options.data[0].options?.map(option => `${chalk.green(option.name)}:${chalk.greenBright(option.value)}`).join(", ")}`;
            }
            Logger.debug(`${interaction.user.tag} ran ${chalk.yellow("/"+interaction.commandName)} ${args} in #${interaction.guild?.id || "DM"}`, true);
        } catch (error) {
            Logger.error(`Error executing ${interaction.commandName}: ${error}`, true);

            let ErrorResponse = new ContainerBuilder();
            ErrorResponse.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## :warning: Error!`))
            ErrorResponse.addSeparatorComponents(new SeparatorBuilder());
            ErrorResponse.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`An error occured while executing this command!
Details:
\`\`\`
${error instanceof Error ? error.stack : error}
\`\`\``))
            let ButtonRow = new ActionRowBuilder<ButtonBuilder>();
            ButtonRow.addComponents(
                new ButtonBuilder()
                    .setLabel("Report Issue")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.gg/URZjWdevk6")
            );

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    components: [ErrorResponse, ButtonRow],
                    flags: [MessageFlags.IsComponentsV2]
                })
            } else {
                await interaction.reply({
                    components: [ErrorResponse, ButtonRow],
                    flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral]
                });
            }
        }
    });
}