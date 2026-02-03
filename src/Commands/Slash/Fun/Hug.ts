import { ApplicationIntegrationType, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, ThumbnailBuilder } from "discord.js";
module.exports = {
    data: new SlashCommandBuilder()
        .setName("hug")
        .setDescription("Give someone a hug!")
        .addUserOption(option => 
            option.setName("target")
                .setDescription("The user to hug")
                .setRequired(true))
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ])
        .setIntegrationTypes([
            ApplicationIntegrationType.GuildInstall,
            ApplicationIntegrationType.UserInstall
        ]),

    async execute(interaction: ChatInputCommandInteraction) {
        const responses = [
            "{caller} gives {target} a warm hug!",
            "{caller} wraps their arms around {target} in a big hug!",
            "{caller} hugs {target} tightly!",
            "{caller} gives {target} a friendly squeeze!",
            "{caller} pulls {target} into a comforting hug!",
            "{caller} shares a heartfelt hug with {target}!",
            "{caller} runs over and hugs {target}!",
            "{caller} tackles {target} with a bear hug!",
            "{caller} embraces {target} gently.",
            "{caller} gives {target} a quick but firm hug.",
            "{caller} engulfs {target} in a massive hug!",
            "{caller} sneaks up and hugs {target} from behind!",
            "{caller} delivers a super effective hug to {target}!",
            "{caller} thinks {target} needs a hug, so here it is!",
            "{target} receives a surprise hug from {caller}!",
            "A wild {caller} appears and hugs {target}!"
        ]

        const caller = interaction.user;
        const target = interaction.options.getUser("target", true);
        let response = responses[Math.floor(Math.random() * responses.length)];

        // Easter egg
        if(target.id === interaction.client.user?.id) {
            response = "{caller} hugs me! *blushes* ʕ•́ᴥ•̀ʔっ";
        }
        if(target.id === caller.id) {
            response = "{caller} hugs themselves. It's... nice, I guess?";
        }

        response = response.replace("{caller}", `<@${caller.id}>`).replace("{target}", `<@${target.id}>`);

        const HugGifs: string[] = [
            "https://c.tenor.com/P9YD49mfnxkAAAAd/tenor.gif",
            "https://c.tenor.com/OrJiTqPixtYAAAAd/tenor.gif",
            "https://c.tenor.com/30l78d5MMF4AAAAd/tenor.gif",
            "https://c.tenor.com/4BjxInu7fa4AAAAd/tenor.gif",
            "https://c.tenor.com/-jJlxJOR2yIAAAAd/tenor.gif",
            "https://c.tenor.com/TKM7R7fQjpMAAAAd/tenor.gif",
            "https://c.tenor.com/K-vGTS6YfcYAAAAd/tenor.gif"
        ];
        const selectedGif = HugGifs.length > 0 ? HugGifs[Math.floor(Math.random() * HugGifs.length)] : null;

        const Response = new ContainerBuilder()
        Response.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`### <:cathug:1468240313851183239> ${response}`)
        );

        if (selectedGif) {
            Response.addSeparatorComponents(new SeparatorBuilder());
            Response.addMediaGalleryComponents(new MediaGalleryBuilder()
                .addItems(new MediaGalleryItemBuilder().setURL(selectedGif))
            );
        }
        
        await interaction.reply({ 
            components: [Response],
            flags: [MessageFlags.IsComponentsV2],
            allowedMentions: { parse: [] }
        });
    }
}