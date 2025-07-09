// src/lib/models/Admin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'spc'],
        default: 'admin',
        required: true
    }
}, { timestamps: true });

// Pre-save hook removed to prevent double hashing
// Passwords should be hashed manually before saving

adminSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Change export to CommonJS
export const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
