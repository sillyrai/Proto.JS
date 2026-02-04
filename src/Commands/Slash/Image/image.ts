import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MessageFlags, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder } from "discord.js";
let pet = require("./Subcommands/pet");
let deepfry = require("./Subcommands/Deepfry");
let caption = require("./Subcommands/Caption");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("image")
        .setDescription("All things image related")
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ])
        .setIntegrationTypes([
            ApplicationIntegrationType.GuildInstall,
            ApplicationIntegrationType.UserInstall
        ])
        
        .addSubcommand(pet.data)
        .addSubcommand(deepfry.data)
        .addSubcommand(caption.data)
        ,

    async execute(interaction: ChatInputCommandInteraction) {
        // Check if user has voted on top.gg before allowing them to use the image commands
        let voteReq = await fetch(`https://top.gg/api/v1/projects/@me/votes/${interaction.user.id}?source=discord`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.TOP_GG_API_KEY}`
            }
        })

        let body = await voteReq.json();
        console.log(body);
        if(body.status == 404 || body.expires_at < Date.now()) {
        //if(true) {
            let Container = new ContainerBuilder()
            Container.addTextDisplayComponents(new TextDisplayBuilder().setContent("## :ballot_box: Vote required!"))
            Container.addSeparatorComponents(new SeparatorBuilder());
            Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`Image related commands are available to users who have voted for the bot recently!
If you want to use image commands, please click the button below to 
vote for the bot on top.gg! (its free and only takes a few seconds!)`));

            let ButtonRow = new ActionRowBuilder<ButtonBuilder>();
            ButtonRow.addComponents(new ButtonBuilder()
                    .setLabel("🗳️ Vote for the bot")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://top.gg/bot/724601984241369100/vote"));

            Container.addActionRowComponents(ButtonRow);
            await interaction.reply({ 
                components: [Container],
                flags: [MessageFlags.IsComponentsV2]
            });
            return;
        } 


        const subcommand = interaction.options.getSubcommand();
        if(subcommand === "pet") await pet.execute(interaction);
        if(subcommand === "deepfry") await deepfry.execute(interaction);
        if(subcommand === "caption") await caption.execute(interaction);
    }
}