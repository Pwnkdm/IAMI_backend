const mongoose = require("mongoose");

// User Schema with only role-based fields
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["customer", "agent"], // Only "customer" or "agent"
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// Create the model for User
const User = mongoose.model("User", UserSchema);

module.exports = User;
