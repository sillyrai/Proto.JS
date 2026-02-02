import GuildSchema from "../Schemas/GuildSchema"
import UserSchema from "../Schemas/UserSchema"

export default {
    async getGuild(guildId: string) {
        let dbGuild = await GuildSchema.findOne({ _id: guildId });
        if (!dbGuild)
            dbGuild = new GuildSchema({ _id: guildId });
        return dbGuild;
    },

    async getUser(userId: string) {
        let dbUser = await UserSchema.findOne({ _id: userId });
        if (!dbUser)
            dbUser = new UserSchema({ _id: userId });
        return dbUser;
    }
}