import mongoose, { Schema } from "mongoose";
import BlacklistSchema from "./BlacklistSchema";
import EconomySchema from "./EconomySchema";
import FursonaSchema from "./FursonaSchema";

let UserSchema = new Schema({
    _id: { type: String, required: true },

    blacklisted: { type: BlacklistSchema, default: {} },
    economy: { type: EconomySchema, default: {} },
    fursonas: { type: [FursonaSchema], default: [] },
    flags: { type: [String], default: [] },
}, {versionKey: false})

export default mongoose.model("User", UserSchema, "users");