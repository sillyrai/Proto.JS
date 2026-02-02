import mongoose, { Schema } from "mongoose";
import StarboardSchema from "./StarboardSchema";
import BlacklistSchema from "./BlacklistSchema";
import WelcomerSchema from "./WelcomerSchema";

let GuildSchema = new Schema({
    _id: { type: String, required: true, index: true },

    starboard: { type: StarboardSchema, default: {} },
    blacklisted: { type: BlacklistSchema, default: {} },
    welcomer: { type: WelcomerSchema, default: {} },

}, {versionKey: false})

export default mongoose.model("Guild", GuildSchema, "guilds");