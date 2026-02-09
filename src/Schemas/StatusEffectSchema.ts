import mongoose, { Schema } from "mongoose";

let StatusEffectSchema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: "No Description" },
}, { versionKey: false });

export default mongoose.model("StatusEffect", StatusEffectSchema, "statuseffects");