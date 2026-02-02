import mongoose, { Schema } from "mongoose";

let UserSchema = new Schema({
    _id: { type: String, required: true, index: true },

    blacklisted: {
        isBlacklisted: { type: Boolean, default: false },
        reason: { type: String, default: null },
    },

    premium: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    
    economy: {
        balance: { type: Number, default: 0 },
    }
}, {versionKey: false})

export default mongoose.model("User", UserSchema, "users");