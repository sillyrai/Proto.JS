import { Schema } from "mongoose";

let BlacklistSchema = new Schema({
    isBlacklisted: { type: Boolean, default: false },
    reason: { type: String, default: null },
}, { versionKey: false, _id: false });

export default BlacklistSchema;