import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, InteractionResponseType, MessageFlags, SectionBuilder, SeparatorBuilder, SlashCommandSubcommandBuilder, TextDisplayBuilder, ThumbnailBuilder, User } from "discord.js";
import Database from "../../../../Modules/Database";
import TextParser from "../../../../Modules/TextParser";
import Logger from "../../../../Modules/Logger";

type Card = {
    suit: string;
    rank: string;
    value: number;
    hidden?: boolean;
};

function dealCard(hidden: boolean = false): Card {
    const suits = ["❤️", "♦️", "♣️", "♠️"];
    const ranks = [
        { rank: "2", value: 2 },
        { rank: "3", value: 3 },
        { rank: "4", value: 4 },
        { rank: "5", value: 5 },
        { rank: "6", value: 6 },
        { rank: "7", value: 7 },
        { rank: "8", value: 8 },
        { rank: "9", value: 9 },
        { rank: "10", value: 10 },
        { rank: "J", value: 10 },
        { rank: "Q", value: 10 },
        { rank: "K", value: 10 },
        { rank: "A", value: 11 } // Ace can be 1 or 11, handled in game logic
    ];

    const suit = suits[Math.floor(Math.random() * suits.length)];
    const rankObj = ranks[Math.floor(Math.random() * ranks.length)];
    return { suit, rank: rankObj.rank, value: rankObj.value, hidden: hidden };
}

function calculateHandValue(cards: Card[]): number {
    let value = 0;
    let aces = 0;

    for (const card of cards) {
        value += card.value;
        if (card.rank === "A") aces++;
    }

    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }

    return value;
}

function createCardDisplayContainer(betAmount:bigint, player:User, playerCards: Card[], dealerCards: Card[]): ContainerBuilder {
    let Container = new ContainerBuilder();

    Container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## :black_joker: Blackjack Game
Bet Amount: **${TextParser.BigIntComma(betAmount)} coins**`));
    Container.addSeparatorComponents(new SeparatorBuilder());

    let PlayerSection = new SectionBuilder();
    PlayerSection.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${player.username}'s Cards:`));
    let playerRowText = ""
    playerCards.forEach(card => {
        //PlayerSection.addTextDisplayComponents(new TextDisplayBuilder().setContent(`- ${card.rank} of ${card.suit}`));
        playerRowText += `\`${card.rank}${card.suit}\` `
    });
    playerRowText += `\nTotal: ${calculateHandValue(playerCards)}`;
    PlayerSection.addTextDisplayComponents(new TextDisplayBuilder().setContent(playerRowText));
    PlayerSection.setThumbnailAccessory(new ThumbnailBuilder().setURL(player.displayAvatarURL({ size: 256 })));
    Container.addSectionComponents(PlayerSection);

    Container.addSeparatorComponents(new SeparatorBuilder());

    let DealerSection = new SectionBuilder();
    DealerSection.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### Dealer's Cards:`));
    let DealerRowText = ""
    dealerCards.forEach(card => {
        if(card.hidden) {
            DealerRowText += "+ ? "
        } else {
            //DealerSection.addTextDisplayComponents(new TextDisplayBuilder().setContent(`- ${card.rank} of ${card.suit}`));
            DealerRowText += `\`${card.rank}${card.suit}\` `
        }
    });
    DealerRowText += `\nTotal: ${calculateHandValue(dealerCards.filter(c => !c.hidden))}${dealerCards.some(c => c.hidden) ? " + ?" : ""}`;
    DealerSection.addTextDisplayComponents(new TextDisplayBuilder().setContent(DealerRowText));
    DealerSection.setThumbnailAccessory(new ThumbnailBuilder().setURL(player.client.user.displayAvatarURL({ size: 256 }))); // Placeholder dealer image
    Container.addSectionComponents(DealerSection);

    return Container;
}

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("blackjack")
        .setDescription("💸 Play a game of blackjack to win or lose coins")
        .addStringOption(option => 
            option.setName("bet")
                .setDescription("Amount of coins to bet (e.g., 100, 5k)")
                .setRequired(true)),
                
                
    async execute(interaction: ChatInputCommandInteraction) {
        let dbUser = await Database.getUser(interaction.user.id);

        let betInput = interaction.options.getString("bet", true);

        // Parse bet amount
        let betAmount = TextParser.SuffixNumber(betInput);
        if(!betAmount)
            return interaction.reply({ content: "Invalid bet amount. Please enter a valid number (e.g., 100, 5k).", flags: [MessageFlags.Ephemeral] });
        if(BigInt(betAmount) > BigInt(dbUser.economy.balance))
            return interaction.reply({ content: "You do not have enough coins to make that bet.", flags: [MessageFlags.Ephemeral] });

        let balance = dbUser.economy.balance;
        let playerCards: Card[] = [];
        let dealerCards: Card[] = [];

        // Initial deal
        playerCards.push(dealCard());
        dealerCards.push(dealCard());
        playerCards.push(dealCard());
        dealerCards.push(dealCard(true)); // Dealer's second card is hidden

        // Calculate totals
        let Board = createCardDisplayContainer(betAmount, interaction.user, playerCards, dealerCards);
        let ButtonRow = new ActionRowBuilder<ButtonBuilder>();
        let HitButton = new ButtonBuilder()
            .setCustomId("hit")
            .setLabel("Hit")
            .setStyle(ButtonStyle.Secondary);
        let StandButton = new ButtonBuilder()
            .setCustomId("stand")
            .setLabel("Stand")
            .setStyle(ButtonStyle.Secondary);
        ButtonRow.addComponents(HitButton, StandButton);
        Board.addSeparatorComponents(new SeparatorBuilder());
        Board.addActionRowComponents(ButtonRow);

        let response = await interaction.reply({ 
            components: [Board],
            flags: [MessageFlags.IsComponentsV2]
        });

        // actual game logic lmao

        let gameOver = false;

        const collector = interaction.channel?.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 60000
        });
        collector?.on('collect', async i => {
            if(gameOver) return;
            if(i.customId === "hit") {
                // Player hits
                playerCards.push(dealCard());
                // Check for bust
                let playerTotal = calculateHandValue(playerCards);
                if(playerTotal > 21) {
                    // Player busts
                    gameOver = true;
                    dbUser.economy.balance = `${BigInt(dbUser.economy.balance) - BigInt(betAmount)}`;
                    await dbUser.save();
                    let FinalBoard = createCardDisplayContainer(betAmount, interaction.user, playerCards, dealerCards);
                    FinalBoard.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## :x: You busted! You lost **${TextParser.BigIntComma(betAmount)} coins**.\n${TextParser.NumDiffBigInt(balance, dbUser.economy.balance)}`));
                    await i.update({ 
                        components: [FinalBoard],
                    });
                    return;
                }
                let UpdatedBoard = createCardDisplayContainer(betAmount, interaction.user, playerCards, dealerCards);
                UpdatedBoard.addSeparatorComponents(new SeparatorBuilder());
                UpdatedBoard.addActionRowComponents(ButtonRow);
                await i.update({ 
                    components: [UpdatedBoard],
                });
            } else if(i.customId === "stand") {
                // Player stands, dealer's turn
                // Reveal dealer's hidden card
                dealerCards[1].hidden = false;
                let dealerTotal = calculateHandValue(dealerCards);
                while(dealerTotal < 17) {
                    dealerCards.push(dealCard());
                    dealerTotal = calculateHandValue(dealerCards);
                }
                // Determine winner
                let playerTotal = calculateHandValue(playerCards);
                gameOver = true;
                let FinalBoard = createCardDisplayContainer(betAmount, interaction.user, playerCards, dealerCards);
                if(dealerTotal > 21 || playerTotal > dealerTotal) {
                    // Player wins
                    dbUser.economy.balance = `${BigInt(dbUser.economy.balance) + BigInt(betAmount)}`;
                    await dbUser.save();
                    FinalBoard.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## :tada: You win! You won **${TextParser.BigIntComma(betAmount)} coins**!\n${TextParser.NumDiffBigInt(balance, dbUser.economy.balance)}`));
                    Logger.info(`User ${interaction.user.id} won ${betAmount} coins in blackjack.`);
                } else if(playerTotal < dealerTotal) {
                    // Dealer wins
                    dbUser.economy.balance = `${BigInt(dbUser.economy.balance) - BigInt(betAmount)}`;
                    await dbUser.save();
                    FinalBoard.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## :x: You lose! You lost **${TextParser.BigIntComma(betAmount)} coins**.\n${TextParser.NumDiffBigInt(balance, dbUser.economy.balance)}`));
                    Logger.info(`User ${interaction.user.id} lost ${betAmount} coins in blackjack.`);
                } else {
                    // Push
                    FinalBoard.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## :handshake: It's a push! Your bet has been returned.`));
                }
                await i.update({ 
                    components: [FinalBoard],
                });

            }
        });

    }
}