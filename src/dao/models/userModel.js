import mongoose from "mongoose";

const userCollection = "users";

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: false },
    password: { type: String, required: true },
    passwordHistory: { type: [String], default: [] },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiresAt: { type: Date, default: null },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
    role: { type: String, default: "user" }
});

const userModel = mongoose.model(userCollection, userSchema);

export default userModel;
