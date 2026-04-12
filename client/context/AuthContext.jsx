import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {io} from "socket.io-client"
import { cryptoEngine } from "../src/lib/crypto.js";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({children})=>{

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUser, setOnlineUser] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    //checkif user is authenticated and if so, set the user data and connect the socket
    const checkAuth = async ()=>{
        try {
            const {data} = await axios.get("/api/auth/check");
            if(data.success){
                cryptoEngine.setUserId(data.user._id);
                // Migrate old globally-scoped key to namespaces if present
                let oldKey = localStorage.getItem('cipherTalk_privateKey');
                if (oldKey) {
                    localStorage.setItem('cipherTalk_privateKey_' + data.user._id, oldKey);
                    localStorage.removeItem('cipherTalk_privateKey');
                }

                setAuthUser(data.user)
                connectSocket(data.user)

                // Check RSA Keys constraints and potential corruption
                let existingKey = localStorage.getItem('cipherTalk_privateKey_' + data.user._id);
                let needsNewKeys = !existingKey;

                if (existingKey) {
                    const localDerivedPublicKey = cryptoEngine.getPublicKeyPemFromStorage();
                    
                    if (data.user.publicKey && localDerivedPublicKey) {
                        const isMatch = cryptoEngine.checkKeyMatch(localDerivedPublicKey, data.user.publicKey);
                        if (!isMatch) {
                            console.warn("CYPHER WARNING: Local private key does not match server public key! Regenerating to fix collision...");
                            needsNewKeys = true;
                        }
                    }
                }

                if(needsNewKeys) {
                    console.log("Generating fresh RSA Keys for Session...");
                    const keys = await cryptoEngine.generateKeyPair();
                    await axios.put("/api/auth/update-public-key", { publicKey: keys.publicKey });
                }
            }
        } catch (error) {
            console.error(error.message);
        } finally {
            setIsCheckingAuth(false);
        }
    }

    const login = async (email, password) => {
        try {
            const { data } = await axios.post("/api/auth/login", { email, password });
            if(data.success) {
                localStorage.setItem("token", data.token);
                setToken(data.token);
                axios.defaults.headers.common["token"] = data.token;
                
                cryptoEngine.setUserId(data.userData._id);
                let oldKey = localStorage.getItem('cipherTalk_privateKey');
                if (oldKey) {
                    localStorage.setItem('cipherTalk_privateKey_' + data.userData._id, oldKey);
                    localStorage.removeItem('cipherTalk_privateKey');
                }

                setAuthUser(data.userData);
                
                // Key Generation or Collision Avoidance
                let existingKey = localStorage.getItem('cipherTalk_privateKey_' + data.userData._id);
                let needsNewKeys = !existingKey;

                if (existingKey) {
                    const localDerivedPublicKey = cryptoEngine.getPublicKeyPemFromStorage();
                    
                    if (data.userData.publicKey && localDerivedPublicKey) {
                        const isMatch = cryptoEngine.checkKeyMatch(localDerivedPublicKey, data.userData.publicKey);
                        if (!isMatch) {
                            console.warn("CYPHER WARNING: Local private key does not match server public key! Regenerating to fix collision...");
                            needsNewKeys = true;
                        }
                    }
                }

                if(needsNewKeys) {
                    const keys = await cryptoEngine.generateKeyPair();
                    await axios.put("/api/auth/update-public-key", { publicKey: keys.publicKey });
                }

                connectSocket(data.userData);
                toast.success(data.message);
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    }

    const signUp = async (fullName, email, password, bio) => {
        try {
            // First, absolutely clear any lingering session state before generating keys
            cryptoEngine.setUserId(null);

            // Generate RSA Keys before signup. This temporary key will be stored without namespace.
            toast.loading("Generating secure keys...", {id: "signup"});
            const keys = await cryptoEngine.generateKeyPair();

            const { data } = await axios.post("/api/auth/signup", { 
                fullName, email, password, bio, publicKey: keys.publicKey 
            });
            if(data.success) {
                localStorage.setItem("token", data.token);
                setToken(data.token);
                axios.defaults.headers.common["token"] = data.token;

                cryptoEngine.setUserId(data.userData._id);
                let currentKey = localStorage.getItem('cipherTalk_privateKey');
                if (currentKey) {
                    localStorage.setItem('cipherTalk_privateKey_' + data.userData._id, currentKey);
                    localStorage.removeItem('cipherTalk_privateKey');
                }

                setAuthUser(data.userData);
                connectSocket(data.userData);
                toast.success(data.message, {id: "signup"});
                return true;
            } else {
                toast.error(data.message, {id: "signup"});
                return false;
            }
        } catch (error) {
            toast.error(error.message, {id: "signup"});
            return false;
        }
    }

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        cryptoEngine.setUserId(null);
        if(socket) socket.disconnect();
        // Do NOT remove private key on logout to allow reading offline messages on same device later,
        // or remove it if strictly ephemeral (but we decided offline reading requires keeping it).
    }

    const deleteAccount = async () => {
        try {
            const res = await axios.delete("/api/auth/delete");
            if (res.data.success) {
                toast.success("Account and associated messages terminated.");
                logout();
                return true;
            } else {
                toast.error(res.data.message);
                return false;
            }
        } catch(error) {
            toast.error(error.response?.data?.message || error.message);
            return false;
        }
    }

    //connect socket function to handle socket connection and online users updates
    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return;                                                              
        const newSocket = io(backendUrl,{
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds)=>{
            setOnlineUser(userIds);
        })
    }

    const updateProfile = async (data) => {
        try {
            const res = await axios.put("/api/auth/update-profile", data);
            if(res.data.success) {
                setAuthUser(res.data.user);
                toast.success("Profile updated successfully!");
                return true;
            } else {
                toast.error(res.data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    }

    useEffect(()=>{
        if(token){
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth();
    },[])
    
    const value ={
        axios,
        authUser,
        onlineUser,
        socket,
        isCheckingAuth,
        login,
        signUp,
        logout,
        updateProfile,
        deleteAccount
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}