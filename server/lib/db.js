import mongoose from 'mongoose';

//function to connect mongodb database
export const connectDB = async () =>{
    try {
        mongoose.connection.on('connected', ()=>{
            console.log("database connected....")
        });
        
        // MONGODB_URI is from .env, make sure exact casing is used for dot-env compatibility
        const MONGODB_URI = process.env.MONGODB_URI || process.env.mongoDB_URI;
        
        if (!MONGODB_URI) {
            console.error("FATAL: MONGODB_URI is completely missing from your .env file!");
            process.exit(1);
        }
        
        await mongoose.connect(`${MONGODB_URI}/chat-app`, {
            serverSelectionTimeoutMS: 5000, 
            connectTimeoutMS: 10000
        });
    } catch (error) {
        console.error("\n❌ MONGODB CONNECTION ERROR: Could not connect to your MongoDB Atlas cluster.");
        console.error("1. Please check if your free cluster (cluster0.azquml2.mongodb.net) is paused or deleted.");
        console.error("2. Ensure your current network or VPN isn't blocking MongoDB SRV queries (port 53).");
        console.error("Error specifics:", error.message, "\n");
        process.exit(1); // Force crash so we don't start a zombie Express server
    }
}