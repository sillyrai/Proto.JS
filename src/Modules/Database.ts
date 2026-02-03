import GuildSchema from "../Schemas/GuildSchema"
import ItemSchema from "../Schemas/ItemSchema";
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
    },

    async getItem(itemId: string) {
        let dbItem = await ItemSchema.findOne({ _id: itemId });
        return dbItem;
    },

    async createItem(id:string, name:string, description:string, buyPrice:bigint, sellPrice:bigint, consumable:boolean) {
        let newItem = new ItemSchema({
            _id: id,
            info: {
                name: name,
                description: description
            },
            prices: {
                buy: buyPrice.toString(),
                sell: sellPrice.toString()
            },
            consumable: consumable
        });
        await newItem.save();
        return newItem;
    }
}