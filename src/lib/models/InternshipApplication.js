// src/lib/models/InternshipApplication.js
import mongoose from 'mongoose';
import { InternshipPosting } from './InternshipPosting'; // Import to use in pre-save hook

const internshipApplicationSchema = new mongoose.Schema({
    internship_posting_id: { type: mongoose.Schema.Types.ObjectId, ref: 'InternshipPosting', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Assuming 'User' is your student model
    recruiter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
        required: true,
        default: 'pending'
    },
    applied_date: { type: Date, required: true, default: Date.now },
    notes: { type: String, maxlength: 1000 }
}, { timestamps: true });

// Add compound indexes for common queries
internshipApplicationSchema.index({ internship_posting_id: 1, status: 1 });
internshipApplicationSchema.index({ student_id: 1, status: 1 });
internshipApplicationSchema.index({ recruiter_id: 1, status: 1 });
internshipApplicationSchema.index({ applied_date: -1 });

// Ensure a student can apply only once per internship posting
internshipApplicationSchema.index({ internship_posting_id: 1, student_id: 1 }, { unique: true });

// Pre-save middleware to validate recruiter consistency in applications
internshipApplicationSchema.pre('save', async function(next) {
    // Only run this logic if it's a new document or internship_posting_id/recruiter_id changed
    if (this.isNew || this.isModified('internship_posting_id') || this.isModified('recruiter_id')) {
        const internshipPosting = await InternshipPosting.findById(this.internship_posting_id);
        if (internshipPosting && internshipPosting.recruiter_id.toString() !== this.recruiter_id.toString()) {
            return next(new Error('Application recruiter_id must match internship posting recruiter_id'));
        } else if (!internshipPosting) {
            return next(new Error('Internship Posting not found.'));
        }
    }
    next();
});

export const InternshipApplication = mongoose.models.InternshipApplication || mongoose.model('InternshipApplication', internshipApplicationSchema);