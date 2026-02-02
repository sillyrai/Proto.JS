import mongoose, { Schema } from "mongoose";
import BlacklistSchema from "./BlacklistSchema";

let UserSchema = new Schema({
    _id: { type: String, required: true },

    blacklisted: { type: BlacklistSchema, default: {} },
    premium: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
}, {versionKey: false})

export default mongoose.model("User", UserSchema, "users");