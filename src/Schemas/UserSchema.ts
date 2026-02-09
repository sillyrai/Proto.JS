import mongoose, { Schema } from "mongoose";
import BlacklistSchema from "./BlacklistSchema";
import EconomySchema from "./EconomySchema";
import FursonaSchema from "./FursonaSchema";
import StatusEffectSchema from "./StatusEffectSchema";

let CounterSchema = new Schema({
    boop: { type: Number, default: 0 },
    hug: { type: Number, default: 0 },
    lick: { type: Number, default: 0 },
    nuzzle: { type: Number, default: 0 },
    pat: { type: Number, default: 0 },
}, { versionKey: false, _id: false })

let UserStatusEffectSchema = new Schema({ // rerfer to StatusEffectSchema,
    _id: { type: String, required: true }, // link to a StatusEffectSchema _id
    intensity: { type: Number, default: 1 },
    expiresAt: { type: Date, required: true },
    hidden: { type: Boolean, default: false } 
}, { versionKey: false, _id: false });

let UserSchema = new Schema({
    _id: { type: String, required: true },
    blacklisted: { type: BlacklistSchema, default: {} },
    economy: { type: EconomySchema, default: {} },
    fursonas: { type: [FursonaSchema], default: [] },
    flags: { type: [String], default: [] },
    counters: { type: CounterSchema, default: {} },
    statusEffects: { type: [UserStatusEffectSchema], default: [] }
}, {versionKey: false})

export default mongoose.model("User", UserSchema, "users");