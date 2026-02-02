import { Schema } from "mongoose";

let StarboardSchema = new Schema({
    channel: { type: String, default: null },
    threshold: { type: Number, default: 5 },
    emoji: { type: String, default: "⭐" },
    enabled: { type: Boolean, default: false },
    posted: { type: [String], default: [] }
}, { versionKey: false, _id: false });

export default StarboardSchema;