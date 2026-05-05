import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const isProduction = process.env.NODE_ENV === "production";
const authCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
};

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error registering user" });
    }
}


const loginUser = async (req, res) => {
    const {  email, password } = req.body;
    try{
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "User not found" 
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid password" 
            });
        }
        const token = jwt.sign(
            {id: user._id, role: user.role, email: user.email},
            JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );
            res
            .cookie("token", token, authCookieOptions)
            .status(200)
            .json({ 
                success: true,
                message: "User logged in successfully",
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                }
            }); 
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error registering user" });
    }
}


const logoutUser = async (req, res) => {
    res
    .clearCookie("token", authCookieOptions)
    .status(200)
    .json({
        success: true,
         message: "User logged out successfully" }); 
}

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            success: false,
             message: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({
            message: "Unauthorized" });
    }
    
}

export {
    registerUser, 
    loginUser,
    logoutUser, 
    authMiddleware}
    
        
