import mongoose, { Schema } from "mongoose";

let PriceSchema = new Schema({
    buy: { type: String, required: true }, // Using string to store bigint
    sell: { type: String, required: true } // Using string to store bigint
}, {versionKey: false, _id: false});

let InfoSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }
}, {versionKey: false, _id: false});

let ItemSchema = new Schema({
    _id: { type: String, required: true }, // id of the item (e.g "apple"), unlike rest where _id is a number, this is a string
    info: { type: InfoSchema, required: true }, // item display name (i,e "🍎 Apple") and description
    prices: { type: PriceSchema, required: true },
    consumable: { type: Boolean, default: true }, // Whether the item dissapears after use
    onsale: { type: Boolean, default: true } // Whether the item is available for purchase in the shop
}, {versionKey: false})

export default mongoose.model("Item", ItemSchema, "items");