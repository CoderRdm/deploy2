// src/lib/models/InternshipPost.js
import mongoose from 'mongoose';

const internshipRemunerationSchema = new mongoose.Schema({ // Define sub-schema for internship remuneration
    other: { type: String }, // Accommodation, Food etc.
    stipend: { type: Number },
    ctcPPO: { type: Number } // CTC if PPO offered
}, { _id: false });

const internshipSelectionProcessSchema = new mongoose.Schema({ // Define sub-schema for internship selection process
    aptitudeTest: { type: Boolean },
    technicalTest: { type: Boolean },
    groupDiscussion: { type: Boolean },
    personalInterview: { type: Boolean },
    provisionForWaitlist: { type: Boolean }
}, { _id: false });

const InternshipPostSchema = new mongoose.Schema({
    // ABOUT ORGANIZATION
    dateSubmitted: { type: Date, default: Date.now },
    organizationName: { type: String, required: true },
    website: { type: String },
    organizationType: { type: String, enum: ['Private sector', 'Start-up', 'Govt. owned', 'Public sector', 'MNC (Indian/Foreign)', 'other'], required: true },
    organizationTypeOther: { type: String },

    // Industry Sector
    industrySector: { type: String, enum: [
        'Analytics', 'Consulting', 'Core (Technical)', 'Finance', 'IT',
        'Education', 'Sales & Mktg.', 'Management', 'Other (pls. specify)'
    ], required: true },
    industrySectorOther: { type: String },

    // INTERN PROFILE
    internshipProfile: { type: String, required: true },
    tentativeDateOfJoining: { type: Date },
    internshipDuration: { type: String },
    placeOfPosting: { type: String },

    // DEGREE/ DISCIPLINE OF STUDENT REQUIRED
    requiredPrograms: [{ type: String }],
    requiredBranches: {
        btech: [{ type: String }],
        barch: [{ type: String }],
        mtech: [{ type: String }],
        mplan: [{ type: String }],
        msc: [{ type: String }],
        mba: [{ type: String }],
        phd: [{ type: String }],
        minorSpecializations: [{ type: String }],
        allBranchesApplicable: { type: Boolean, default: false },
    },

    // PROBABLE NUMBER OF POSITIONS YOU ARE SEEKING TO FILL FROM MNIT
    numberOfPositions: { type: Number },

    // CANDIDATE REQUIREMENT
    cgpaRequirements: { type: String },
    studentPassingYearForInternship: [{ type: String, enum: ['1st year', '2nd year', '3rd year', '4th year', '5th year'] }],
    anyOtherRequirement: { type: String },

    // REMUNERATION PACKAGE DETAILS
    remuneration: {
        btech: { type: internshipRemunerationSchema, default: {} },
        mtech: { type: internshipRemunerationSchema, default: {} },
        mba: { type: internshipRemunerationSchema, default: {} },
        msc: { type: internshipRemunerationSchema, default: {} },
        mplan: { type: internshipRemunerationSchema, default: {} },
        phd: { type: internshipRemunerationSchema, default: {} },
    },

    // SELECTION PROCEDURE
    preferredDatesForCampusVisit: [{ type: Date }],
    numberOfExecutivesVisiting: { type: Number },
    numberOfRoomsRequired: { type: Number },
    prePlacementTalkRequired: { type: Boolean },

    selectionProcess: { type: internshipSelectionProcessSchema, default: {} }, // Embedding the reusable schema
    finalOfferAnnouncement: { type: String, enum: ['Same day', 'Later, but no further interviews', 'Later, after next stage of interviews'] },

    // CONTACT INFORMATION
    contactPerson: { type: String, required: true },
    emailAddress: { type: String, required: true },
    contactAddress: { type: String },
    mobileNo: { type: String },

    // Signature
    signatureName: { type: String },
    signatureDesignation: { type: String },

    // --- NEW FIELD FOR ANNOUNCEMENTS ---
    isAnnounced: {
        type: Boolean,
        default: false,
    },
    // --- NEW: Applications Array ---
    applications: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        appliedDate: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ['Applied', 'Reviewed', 'Interview Scheduled', 'Rejected', 'Selected'],
            default: 'Applied'
        },
        // Enhanced application data
        coverLetter: {
            type: String,
            required: false,
            trim: true
        },
        additionalInfo: {
            type: String,
            trim: true
        },
        eligibilityAcknowledged: {
            type: Boolean,
            required: true,
            default: false
        },
        // Document attachments (for future use)
        attachments: [{
            fileName: String,
            fileUrl: String,
            fileType: String,
            uploadDate: { type: Date, default: Date.now }
        }],
        // Application metadata
        submissionIp: String,
        browserInfo: String
    }]
}, { timestamps: true });

export const InternshipPost = mongoose.models.InternshipPost || mongoose.model('InternshipPost', InternshipPostSchema);