import { ActivityType, Client } from "discord.js";
import { set } from "mongoose";

export default async function(client: Client) {
    client.on("ready", async () => {
        let commandCount = (client as any).commands?.size || 0;
        let guildCount = await client.guilds.fetch().then(guilds => guilds.size);
        const statuses = [
            "Watching you sleep ●w●",
            `${commandCount} commands available! Type / to see them!`,
            `🦊🦊🦊🦊🦊🦊🦊`,
            `${guildCount} servers!`,
            `rawr :3`,
            `boops u`,
            `beep boop!`
        ];

        setInterval(() => {
            let status = statuses[Math.floor(Math.random() * statuses.length)];
            client.user?.setActivity(status, { type: ActivityType.Custom });

        }, 20000); // Change status every 20 seconds
    })
}