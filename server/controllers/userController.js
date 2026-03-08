import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs"

//signup a new User
export const signUp = async (req, res) =>{
    const {fullName, email, password, bio, publicKey} = req.body;

    try {
        if(!email || !fullName || !bio || !password){
            return res.json({success: false, message: "Missing Details"})
        }

        const user = await User.findOne({email})
        if(user){
            return res.json({success:false, message:"Account already exists..."})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password:hashedPassword,
            bio,
            publicKey: publicKey || ""
        })

        const token = generateToken(newUser._id);
        res.json({success:true, userData:newUser, token, message:"Account created Successfully..."})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}


export const login = async (req,res)=>{
    try {
        const {email, password} = req.body;
        const userData = await User.findOne({email})

        if(!userData){
            return res.json({success:false, message:"Invalid Credentials..."})
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password)

        if(!isPasswordCorrect){
            return res.json({success:false, message:"Invalid Credentials..."})
        }

        const token = generateToken(userData._id);
        res.json({success:true, userData, token, message:"Login Successfull..."})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}

export const updateProfile = async (req,res)=>{
    try {
        const { profilePic, bio, fullName} = req.body;

        const userId = req.user._id;
        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new:true})
        }else{
            if(profilePic.startsWith('data:image')){
                const upload = await cloudinary.uploader.upload(profilePic);
                updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName, profilePic:upload.secure_url}, {new:true});
            } else {
                updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName, profilePic}, {new:true});
            }
        }
        res.json({success:true, user:updatedUser})
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}

export const updatePublicKey = async (req,res)=>{
    const { publicKey } = req.body;
    try {
        const userId = req.user._id;
        const updatedUser = await User.findByIdAndUpdate(userId, {publicKey}, {new:true});
        res.json({success:true, user:updatedUser});
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}