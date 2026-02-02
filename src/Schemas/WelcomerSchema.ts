import { Schema } from "mongoose";

let WelcomerSchema = new Schema({
    enabled: { type: Boolean, default: false },
    channel: { type: String, default: null },
    joinMessage: { type: String, default: "Welcome to the server, {user}!" },
    leaveMessage: { type: String, default: "{user} has left the server." },
}, { versionKey: false, _id: false });

export default WelcomerSchema;