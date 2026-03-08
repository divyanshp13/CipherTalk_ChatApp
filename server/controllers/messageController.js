import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import {io, userSocketMap} from "../server.js";



//get all users except the logged in user
export const getUserForSidebar = async (req,res)=>{
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne:userId}}).select("-password");

        //count number of messages not seen
        const unseenMessages = {}
        const promises = filteredUsers.map(async (user)=>{
            const messages = await Message.find({senderId:user._id, recieverId:userId, seen:false})
            if(messages.length>0){
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({success:true, users:filteredUsers, unseenMessages})
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}


export const getMessages = async (req, res)=>{
    try {
        const {id:selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId:myId, recieverId:selectedUserId},
                {senderId:selectedUserId, recieverId:myId},
            ]
        })
        await Message.updateMany({senderId:selectedUserId, recieverId:myId}, {seen:true});

        res.json({success:true, messages})
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}

//api to mark message as seen using message id
export const markMessageAsSeen = async (req, res)=>{
    try {
        const {id} = req.params;
        await Message.findByIdAndUpdate(id, {seen:true});
        res.json({success:true});
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}

//send message to selected user
export const sendMessage = async (req, res)=>{
    try {
        const {text, image, signature, hash, encryptedSessionKey, senderEncryptedSessionKey, expiresAt} = req.body;
        const recieverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            if(image.startsWith('U2Fsd') || !image.startsWith('data:')){
                // Encrypted ciphertext from CryptoJS TripleDES
                const rawBuffer = Buffer.from(image).toString('base64');
                const rawDataUri = `data:text/plain;base64,${rawBuffer}`;
                const uploadResponse = await cloudinary.uploader.upload(rawDataUri, { resource_type: "raw" });
                imageUrl = uploadResponse.secure_url;
            } else {
                const uploadResponse = await cloudinary.uploader.upload(image);
                imageUrl = uploadResponse.secure_url;
            }
        }

        const newMessage = await Message.create({
            senderId,
            recieverId,
            text,
            image: imageUrl,
            signature,
            hash,
            encryptedSessionKey,
            senderEncryptedSessionKey,
            expiresAt,
            isEncrypted: true
        });

        //emit the new message to the reciever's socket
        const recieverSocketId = userSocketMap[recieverId];
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage",newMessage);
        }

        res.json({success:true, newMessage})
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}

//api to delete message from both sides
export const deleteMessage = async (req, res)=>{
    try {
        const {id} = req.params;
        const userId = req.user._id;
        
        const message = await Message.findById(id);
        if(!message) return res.json({success:false, message:"Message not found"});
        
        // Ensure only sender or receiver can delete
        if(message.senderId.toString() !== userId.toString() && message.recieverId.toString() !== userId.toString()) {
            return res.json({success:false, message:"Unauthorized to delete this message"});
        }

        await Message.findByIdAndDelete(id);

        // Emit delete event to receiver
        const otherUserId = message.senderId.toString() === userId.toString() ? message.recieverId : message.senderId;
        const otherSocketId = userSocketMap[otherUserId.toString()];
        if(otherSocketId){
            io.to(otherSocketId).emit("messageDeleted", id);
        }

        res.json({success:true});
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}