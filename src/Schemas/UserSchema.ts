import mongoose, { Schema } from "mongoose";
import BlacklistSchema from "./BlacklistSchema";
import EconomySchema from "./EconomySchema";

let UserSchema = new Schema({
    _id: { type: String, required: true },

    blacklisted: { type: BlacklistSchema, default: {} },
    economy: { type: EconomySchema, default: {} },
    flags: { type: [String], default: [] },
}, {versionKey: false})

export default mongoose.model("User", UserSchema, "users");