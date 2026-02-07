import mongoose, { Schema } from "mongoose";

let FursonaSchema = new Schema({
    name: { type: String, required: true },
    species: { type: String, default: null },
    description: { type: String, default: null },
    imageUrls: { type: [String], default: [] },
}, { versionKey: false });

export default FursonaSchema;