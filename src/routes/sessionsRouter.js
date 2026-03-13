import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import userModel from "../dao/models/userModel.js";
import { cartDBManager } from "../dao/cartDBManager.js";
import { productDBManager } from "../dao/productDBManager.js";
import { toUserCurrentDTO } from "../dtos/userCurrent.dto.js";
import { env } from "../config/env.js";
import { PasswordResetService } from "../services/passwordReset.service.js";

const router = Router();
const JWT_SECRET = env.jwtSecret;
const passwordResetService = new PasswordResetService();

// Register
router.post("/register", async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        if (!email || !password || !first_name || !last_name) return res.status(400).json({ status: "error", message: "Missing fields" });

        const existing = await userModel.findOne({ email });
        if (existing) return res.status(400).json({ status: "error", message: "User already exists" });

        const ProductService = new productDBManager();
        const CartService = new cartDBManager(ProductService);
        const cart = await CartService.createCart();

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = await userModel.create({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword,
            cart: cart._id,
            role: "user"
        });

        return res.status(201).json({ status: "success", payload: { id: newUser._id, email: newUser.email } });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
});

// Login 
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ status: "error", message: "Missing fields" });

        const user = await userModel.findOne({ email });
        if (!user) return res.status(401).json({ status: "error", message: "Invalid credentials" });

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(401).json({ status: "error", message: "Invalid credentials" });

        const payload = { id: user._id, email: user.email, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

        res
            .cookie("jwt", token, {
                httpOnly: true ,
                secure: false,
                sameSite: "lax",
                maxAge: 60 * 60 * 1000 // 1 hora
            })
            .json({
                status: "success",
                message: "Login exitoso"
            });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
});

router.get("/current", passport.authenticate("current", { session: false }), (req, res) => {
    if (!req.user) return res.status(401).json({ status: "error", message: "Unauthorized" });
    return res.json({ status: "success", payload: toUserCurrentDTO(req.user) });
});

// Request password reset
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ status: "error", message: "Missing fields" });

        await passwordResetService.requestReset(email);
        return res.json({ status: "success", message: "If the user exists, an email was sent" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
});

// Reset password 
router.post("/reset-password", async (req, res) => {
    try {
        const token = req.query.token || req.body.token;
        const { password } = req.body;
        await passwordResetService.resetPassword(token, password);
        return res.json({ status: "success", message: "Password updated" });
    } catch (error) {
        return res.status(400).json({ status: "error", message: error.message });
    }
});

export default router;
