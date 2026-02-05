import { ActivityType, Client, Events } from "discord.js";
import { set } from "mongoose";

export default async function(client: Client) {
    client.on(Events.ClientReady, async () => {
        let commandCount = (client as any).commands?.size || 0;
        const statuses = [
            "Watching you sleep ●w●",
            `${commandCount} commands available! Type / to see them!`,
            `🦊🦊🦊🦊🦊🦊🦊`,
            `rawr :3`,
            `boops u`,
            `beep boop!`,
            "BETA VERSION, PLEASE REPORT ANY BUGS @ .gg/s4sSpxn5Hu",
            "☕ a cat has left this hot cocoa for you :3"
        ];

        setInterval(() => {
            let status = statuses[Math.floor(Math.random() * statuses.length)];
            client.user?.setActivity(status, { type: ActivityType.Custom });

        }, 1000*20); // Change status every 20 seconds
    })
}