import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import { cryptoEngine } from "../src/lib/crypto";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { axios, socket, authUser } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [showRightSidebar, setShowRightSidebar] = useState(false);

    // Fetch users for sidebar
    const getUsers = async () => {
        if (!axios.defaults.headers.common["token"]) return;
        setIsUsersLoading(true);
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsUsersLoading(false);
        }
    };

    // Fetch messages for selected user and decrypt them
    const getMessages = async (userId) => {
        setIsMessagesLoading(true);
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                // Decrypt messages asynchronously because we might need to fetch raw blobs from Cloudinary
                const decryptedMessages = await Promise.all(data.messages.map(async (msg) => {
                    return await decryptMessageData(msg);
                }));
                setMessages(decryptedMessages);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsMessagesLoading(false);
        }
    };

    // Decryption Pipeline
    const decryptMessageData = async (msg) => {
        if (!msg.isEncrypted) return msg; // Fallback for old plaintext messages if any
        try {
            // Strictly cast both to strings to avoid ObjectId mismatch
            const isSender = String(msg.senderId) === String(authUser._id);
            
            // 1. Get encrypted session key
            let encryptedSessionKeyBase64 = isSender ? msg.senderEncryptedSessionKey : msg.encryptedSessionKey;
            
            // Backwards compatibility check if sender encrypted key is missing
            if(isSender && !encryptedSessionKeyBase64) {
               return {...msg, text: "🔒 Encrypted Message", hashVerified: false, decryptError: true};
            }

            // 2. Decrypt Session Key using my RSA Private Key
            const sessionKey = cryptoEngine.decryptSessionKey(encryptedSessionKeyBase64);
            
            // 3. Decrypt Content
            let text = msg.text ? cryptoEngine.decryptMessageContent(msg.text, sessionKey) : "";
            
            let image = "";
            let fetchedCiphertext = msg.image || "";
            if (msg.image) {
                if (msg.image.startsWith('http')) {
                    try {
                        const res = await fetch(msg.image);
                        fetchedCiphertext = await res.text();
                    } catch (err) {
                        console.error("Failed to fetch encrypted image payload", err);
                    }
                }
                image = fetchedCiphertext ? cryptoEngine.decryptMessageContent(fetchedCiphertext, sessionKey) || "" : "";
            }

            // 4. Verify Integrity
            let hashVerified = true;
            if(msg.hash) {
                const contentStr = (text || "") + (image || "");
                hashVerified = cryptoEngine.verifyHash(contentStr, String(msg.senderId), msg.hash);
            }

            return {
                ...msg,
                text,
                image,
                hashVerified
            };

        } catch (error) {
            let errorMsg = "⚠️ Failed to decrypt message: Private Key mismatch";
            // Forge throws variations of 'padding', 'data isn't an object', or 'Encrypted message is invalid' when using a new key on old data.
            if (error.message.includes("padding") || error.message.includes("data isn't an object") || error.message.includes("invalid")) {
                errorMsg = "⚠️ Encrypted with a previous/expired Session Key. Unreadable.";
            } else {
                // Only log unexpected errors
                console.error("Decryption failed for message", msg._id, "Reason:", error.message);
            }

            return {
                ...msg,
                text: errorMsg,
                hashVerified: false,
                decryptError: true
            };
        }
    };

    // Send Message Pipeline
    const sendMessage = async (messageData) => {
        if (!selectedUser) return;
        if (!selectedUser.publicKey) {
             toast.error("User has not generated encryption keys yet. Cannot send secure message.");
             return false;
        }

        try {
            // 1. Generate AES Session Key
            const sessionKey = cryptoEngine.generateSessionKey();
            
            // 2. Encrypt Content Layer 1 & 2
            let encryptedText = messageData.text ? cryptoEngine.encryptMessageContent(messageData.text, sessionKey) : "";
            let encryptedImage = messageData.image ? cryptoEngine.encryptMessageContent(messageData.image, sessionKey) : ""; // image is base64
            
            // 3. Hash Content
            const contentStr = (messageData.text || "") + (messageData.image || "");
            const hash = cryptoEngine.generateHash(contentStr, authUser._id);
            
            // 4. Sign Hash
            const signature = cryptoEngine.signData(hash);

            // 5. Encrypt Session Key with Receiver's RSA Public Key
            const encryptedSessionKey = cryptoEngine.encryptSessionKey(sessionKey, selectedUser.publicKey);
            
            // 6. Encrypt Session Key with Sender's RSA Public Key (so we can read our own sent messages later)
            const senderPublicKey = cryptoEngine.getPublicKeyPemFromStorage();
            const senderEncryptedSessionKey = cryptoEngine.encryptSessionKey(sessionKey, senderPublicKey);

            const payload = {
                text: encryptedText,
                image: encryptedImage,
                hash,
                signature,
                encryptedSessionKey,
                senderEncryptedSessionKey
            };

            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, payload);
            
            if (data.success) {
                // Instantly add to local state decrypted
                const localMsg = {
                    ...data.newMessage, 
                    text: messageData.text, 
                    image: messageData.image,
                    isEncrypted: true,
                    hashVerified: true
                };
                setMessages(prev => [...prev, localMsg]);
                return true;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    // Delete message for everyone
    const deleteMessage = async (msgId) => {
        try {
            const { data } = await axios.delete(`/api/messages/${msgId}`);
            if (data.success) {
                setMessages(prev => prev.filter(m => m._id !== msgId));
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Socket listeners for real-time
    useEffect(() => {
        if (!socket) return;
        
        socket.on("newMessage", async (newMessage) => {
            if (selectedUser && String(newMessage.senderId) === String(selectedUser._id)) {
                const decryptedMsg = await decryptMessageData(newMessage);
                setMessages(prev => [...prev, decryptedMsg]);
            }
            // Update unseen count logic could go here
        });

        socket.on("messageDeleted", (msgId) => {
             setMessages(prev => prev.filter(m => m._id !== msgId));
        });

        socket.on("screenshotAlert", (data) => {
            if(selectedUser && data.senderId === selectedUser._id) {
                 toast('⚠ Hacker Alert: ' + selectedUser.fullName + ' captured a screenshot of this conversation.', {
                     icon: '📸',
                     style: { borderRadius: '10px', background: '#333', color: '#00ff00' }
                 });
            }
        });

        return () => {
            socket.off("newMessage");
            socket.off("messageDeleted");
            socket.off("screenshotAlert");
        }
    }, [socket, selectedUser, authUser]);

    const value = {
        users,
        messages,
        selectedUser,
        setSelectedUser,
        isUsersLoading,
        isMessagesLoading,
        getUsers,
        getMessages,
        sendMessage,
        deleteMessage,
        showRightSidebar,
        setShowRightSidebar
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
