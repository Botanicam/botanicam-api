import mongoose from "mongoose"
import { isEmail, isPassword } from "../utils/auth.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username already exists"],
        trim: true,
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [20, "Username must be less than 20 characters long"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already exists"],
        trim: true,
        validate: [isEmail, "Please enter a valid email address"],
        select: false,
        
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        validate: [isPassword, "Please enter a valid password"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false,
    }
})

// Hash password before saving to database
UserSchema.pre("save", async function(next) {
    if(!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.SECRET, {
        expiresIn: "7d",
    });
}

// Verify token
UserSchema.methods.verifyToken = function(token) {
    return jwt.verify(token, process.env.SECRET);
}

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

export default mongoose.model('User', UserSchema);