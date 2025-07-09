// src/lib/models/Recruiter.js
import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: String,
    website: { type: String, match: /^https?:\/\/.+/ },
    industry: {
        type: String,
        enum: [
            'Analytics', 'Consulting', 'Core (Technical)', 'Finance', 'IT',
            'Business Development', 'Sales & Mktg.', 'Management', 'Education',
            'Technology', 'Healthcare', 'Manufacturing', 'Retail', 'Media', 
            'Government', 'Non-profit', 'Other', 'Other (pls. specify)'
        ],
        required: true
    },
    description: { type: String, maxlength: 1000 }
});

const recruiterSchema = new mongoose.Schema({
    first_name: { type: String, required: true, maxlength: 50 },
    last_name: { type: String, required: true, maxlength: 50 },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    phone: { type: String, minlength: 10, maxlength: 15 },
    company: { type: companySchema, required: true }
}, { timestamps: true });

export const Recruiter = mongoose.models.Recruiter || mongoose.model('Recruiter', recruiterSchema);