import { Router } from "express";
import userModel from "../dao/models/userModel.js";
import bcrypt from "bcrypt";

const router = Router();

// List users
router.get("/", async (req, res) => {
    const users = await userModel.find().select("-password");
    res.json({ status: "success", payload: users });
});

// Get user by id
router.get("/:uid", async (req, res) => {
    try {
        const user = await userModel.findById(req.params.uid).select("-password");
        if (!user) return res.status(404).json({ status: "error", message: "User not found" });
        res.json({ status: "success", payload: user });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Update user
router.put("/:uid", async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.password) data.password = bcrypt.hashSync(data.password, 10);

        const updated = await userModel.findByIdAndUpdate(req.params.uid, data, { new: true }).select("-password");
        if (!updated) return res.status(404).json({ status: "error", message: "User not found" });
        res.json({ status: "success", payload: updated });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Delete user
router.delete("/:uid", async (req, res) => {
    try {
        const deleted = await userModel.findByIdAndDelete(req.params.uid).select("-password");
        if (!deleted) return res.status(404).json({ status: "error", message: "User not found" });
        res.json({ status: "success", payload: deleted });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

export default router;
