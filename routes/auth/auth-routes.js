import express from 'express';
const router = express.Router();
import User from "../../models/User.js";

import {registerUser,loginUser,logoutUser, authMiddleware } from "../../controllers/auth-controller.js"

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/check-auth", authMiddleware, async (req, res) => {
    const userRecord = await User.findById(req.user.id).select("username email role");
    const user = {
        ...req.user,
        username: userRecord?.username,
        email: userRecord?.email || req.user.email,
        role: userRecord?.role || req.user.role,
    };
    res.status(200)
    .json({ 
        success: true,
        message: "Authenticated",
        user
     });
});

router.post("/logout",logoutUser);

export default router
