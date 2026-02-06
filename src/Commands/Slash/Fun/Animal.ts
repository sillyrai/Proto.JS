import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, InteractionContextType, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandBuilder, TextDisplayBuilder, TextInputAssertions, ThumbnailBuilder } from "discord.js";
import TextParser from "../../../Modules/TextParser";

async function fetchAnimalUrl(animal_type:string): Promise<string> {
    let imageUrl: string | null = null;
    let headers = {
        "User-Agent": "Proto.JS | @__rai__ on Discord"
    };
    if(animal_type === "dog") {
        let res = await fetch("https://api.tinyfox.dev/img?animal=dog&json=true", {headers});
        let data = await res.json();
        imageUrl = "https://api.tinyfox.dev" + data.loc;

    } else if(animal_type === "cat") {
        let res = await fetch("https://api.thecatapi.com/v1/images/search", {headers});
        let data = await res.json();
        imageUrl = data[0].url;

    } else if(animal_type === "fox") {
        let res = await fetch("https://api.tinyfox.dev/img?animal=fox&json=true", {headers} );
        let data = await res.json();
        imageUrl = "https://api.tinyfox.dev" + data.loc;

    } else if(animal_type === "rabbit") {
        let res = await fetch("https://api.tinyfox.dev/img?animal=bun&json=true", {headers});
        let data = await res.json();
        imageUrl = "https://api.tinyfox.dev" + data.loc;

    } else if(animal_type === "raccoon") {
        let res = await fetch("https://api.tinyfox.dev/img?animal=racc&json=true", {headers} );
        let data = await res.json();
        imageUrl = "https://api.tinyfox.dev" + data.loc;

    } else if(animal_type === "bear") {
        let res = await fetch("https://api.tinyfox.dev/img?animal=bear&json=true", {headers});
        let data = await res.json();
        imageUrl = "https://api.tinyfox.dev" + data.loc;

    } else if(animal_type === "serval") {
        let res = await fetch("https://api.tinyfox.dev/img?animal=serval&json=true", {headers});
        let data = await res.json();
        imageUrl = "https://api.tinyfox.dev" + data.loc;

    } else if(animal_type === "wolf") {
        let res = await fetch("https://api.tinyfox.dev/img?animal=woof&json=true", {headers});
        let data = await res.json();
        imageUrl = "https://api.tinyfox.dev" + data.loc;

    } else if(animal_type === "snow_leopard") {
        let res = await fetch("https://api.tinyfox.dev/img?animal=snep&json=true", {headers});
        let data = await res.json();
        imageUrl = "https://api.tinyfox.dev" + data.loc;
    }
    return imageUrl!;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("animal")
        .setDescription("🦊 Get a cute animal picture!")
        .addStringOption(option => 
            option.setName("animal_type")
                .setDescription("The type of animal to get a picture of")
                .setRequired(true)
                .addChoices( // cute animals
                    { name: "🐶 Dog", value: "dog" },
                    { name: "🐱 Cat", value: "cat" },
                    { name: "🦊 Fox", value: "fox" },
                    { name: "🐰 Rabbit", value: "rabbit" },
                    { name: "🦝 Raccoon", value: "raccoon" },
                    { name: "🐻 Bear", value: "bear" },
                    { name: "🐆 Serval", value: "serval" },
                    { name: "🐺 Wolf", value: "wolf" },
                    { name: "❄️ Snow Leopard", value: "snow_leopard" }
                )
            )
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
        await interaction.deferReply();
        let animalType = interaction.options.getString("animal_type", true);

        let imageUrl = await fetchAnimalUrl(animalType);
        let AnimalDisplay = new ContainerBuilder();
        let emoji = "";
        switch(animalType) {
            case "dog":
                emoji = "🐶";
                break;
            case "cat":
                emoji = "🐱";
                break;
            case "fox":
                emoji = "🦊";
                break;
            case "rabbit":
                emoji = "🐰";
                break;
            case "raccoon":
                emoji = "🦝";
                break;
            case "bear":
                emoji = "🐻";
                break;
            case "serval":
                emoji = "🐆";
                break;
            case "wolf":
                emoji = "🐺";
                break;
            case "snow_leopard":
                emoji = "❄️";
                break;
        }

        AnimalDisplay.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${emoji} ${animalType} 🐾`));
        AnimalDisplay.addSeparatorComponents(new SeparatorBuilder());
        AnimalDisplay.addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(imageUrl)));

        let ButtonRow = new ActionRowBuilder<ButtonBuilder>();
        let NewImageButton = new ButtonBuilder()
            .setCustomId(`new_animal`)
            .setLabel("New Image")
            .setStyle(ButtonStyle.Secondary);
        ButtonRow.addComponents(NewImageButton);

        AnimalDisplay.addActionRowComponents(ButtonRow);

        let resp = await interaction.editReply({ 
            components: [AnimalDisplay], 
            flags: [MessageFlags.IsComponentsV2] 
        });

        const filter = resp.createMessageComponentCollector({ time: 60000*2 });

        filter.on("collect", async i => {
            if(i.user.id !== interaction.user.id) {
                return i.reply({ content: "You cannot interact with this button.", ephemeral: true });
            }
            if(i.customId === "new_animal") {
                let newImageUrl = await fetchAnimalUrl(animalType);
                let Container = new ContainerBuilder();

                Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${emoji} ${animalType} 🐾`));
                Container.addSeparatorComponents(new SeparatorBuilder());
                Container.addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(newImageUrl)));
                Container.addActionRowComponents(ButtonRow);

                await i.update({ 
                    components: [Container], 
                    flags: [MessageFlags.IsComponentsV2] 
                });
            }
        });
    }
}