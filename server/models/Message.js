import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required:true},
    recieverId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required:true},
    text:{type:String},
    image:{type:String},
    seen:{type:Boolean, default:false}, 
    signature: {type:String}, // RSA signature
    hash: {type:String}, // SHA-256 hash
    encryptedSessionKey: {type:String}, // AES key encrypted with receiver's RSA public key
    senderEncryptedSessionKey: {type:String}, // AES key encrypted with sender's RSA public key (so sender can read their own sent messages)
    expiresAt: {type:Date, default: null}, // For self-destructing messages
    isEncrypted: {type:Boolean, default:true},
}, {timestamps: true});

const Message = mongoose.model("Message", messageSchema)     

export default Message;