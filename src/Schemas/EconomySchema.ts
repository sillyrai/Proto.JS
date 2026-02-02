import { Schema } from "mongoose";

let CooldownSchema = new Schema({
    daily: { type: Date, default: Date.now },
    weekly: { type: Date, default: Date.now },
    work: { type: Date, default: Date.now }
}, { versionKey: false, _id: false });


let EconomySchema = new Schema({
    balance: { type: String, default: "0" }, // Using string to store bigint
    cooldowns: { type: CooldownSchema, default: {} }
}, { versionKey: false, _id: false });

export default EconomySchema;