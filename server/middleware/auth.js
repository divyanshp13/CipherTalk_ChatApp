import User from "../models/User.js";
import jwt from "jsonwebtoken";

//middleware to protect the routes
export const protectRoute = async (req,res,next)=>{
    try {
        const token = req.headers.token;

        if(!token) return res.json({success:false, message:"Unauthorized - No Token Provided"})

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decoded.userId).select("-password");

        if(!user) return res.json({success:false, message:"User not found..."})

        req.user = user;
        next();
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}

//Controller to check if the user is authenticated or not
export const checkAuth = (req,res)=>{
    res.json({success:true, user:req.user});
}