import { Schema } from "mongoose";

let WelcomerSchema = new Schema({
    enabled: { type: Boolean, default: false },
    channel: { type: String, default: null },
    joinMessage: { type: String, default: "Welcome to the server, {user.mention}!" },
    leaveMessage: { type: String, default: "{user.username} has left the server." },
}, { versionKey: false, _id: false });

export default WelcomerSchema;