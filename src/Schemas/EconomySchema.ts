import { Schema } from "mongoose";

let CooldownSchema = new Schema({
    daily: { type: Date, default: Date.now },
    weekly: { type: Date, default: Date.now },
    work: { type: Date, default: Date.now }
}, { versionKey: false, _id: false });

let InventoryItemSchema = new Schema({
    _id: { type: String, required: true },
    quantity: { type: String, default: "0" } // Using string to store bigint
}, { versionKey: false, _id: false });

let EconomySchema = new Schema({
    balance: { type: String, default: "0" }, // Using string to store bigint
    cooldowns: { type: CooldownSchema, default: {} },
    inventory: { type: [InventoryItemSchema], default: [] }
}, { versionKey: false, _id: false });

export default EconomySchema;