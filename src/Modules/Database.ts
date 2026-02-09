import GuildSchema from "../Schemas/GuildSchema"
import ItemSchema from "../Schemas/ItemSchema";
import UserSchema from "../Schemas/UserSchema"
import StatusEffectSchema from "../Schemas/StatusEffectSchema";

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

    async createItem(id:string, name:string, description:string, buyPrice:bigint, sellPrice:bigint, consumable:boolean, onsale:boolean) {
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
            consumable: consumable,
            onsale: onsale
        });
        await newItem.save();
        return newItem;
    },

    async getStatusEffect(effectId: string) {
        let dbEffect = await StatusEffectSchema.findOne({ _id: effectId });
        return dbEffect;
    },
    async giveEffect(userId: string, effectId: string, intensity: number, duration: Date, hidden = false) {
        let dbUser = await this.getUser(userId);
        // Check if user already has effect (or at least an expired one, if they have an expired one we remove it and give them the new one)

        let existingEffectIndex = dbUser.statusEffects.findIndex((effect: any) => effect._id === effectId);
        if (existingEffectIndex !== -1) {
            let existingEffect = dbUser.statusEffects[existingEffectIndex];
            if (new Date(existingEffect.expiresAt) > new Date()) {
                // Effect is still active, we update it with the new intensity and duration (duration is refreshed, not added on)
                dbUser.statusEffects[existingEffectIndex].intensity = intensity;
                dbUser.statusEffects[existingEffectIndex].expiresAt = duration;
                dbUser.statusEffects[existingEffectIndex].hidden = hidden;
            }
            else {
                // Effect is expired, we remove it and add the new one
                dbUser.statusEffects.splice(existingEffectIndex, 1);
                dbUser.statusEffects.push({
                    _id: effectId,
                    intensity: intensity,
                    expiresAt: duration,
                    hidden: hidden
                });
            }
        }
        else {
            // User doesn't have effect, we just add it
            dbUser.statusEffects.push({
                _id: effectId,
                intensity: intensity,
                expiresAt: duration,
                hidden: hidden
            });
        }
        await dbUser.save();

        // Also check if this effect actually exists in StatusEffectSchema (not just UserStatusEffectSchema)
        // If not, we create it with default values for now
        let dbEffect = await StatusEffectSchema.findOne({ _id: effectId });
        if (!dbEffect) {
            dbEffect = new StatusEffectSchema({
                _id: effectId,
                name: effectId,
                description: "❔ No description set.",
            });
            await dbEffect.save();
        }
    }
}