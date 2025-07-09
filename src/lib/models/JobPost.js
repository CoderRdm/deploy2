// src/lib/models/JobPost.js
import mongoose from 'mongoose';

const remunerationSchema = new mongoose.Schema({ // Define sub-schema to reuse
    profile: { type: String },
    basic: { type: Number },
    hra: { type: Number },
    other: { type: Number },
    gross: { type: Number },
    takeHome: { type: Number },
    ctc: { type: Number }
}, { _id: false }); // _id: false to prevent Mongoose from creating _id for subdocuments

const selectionProcessSchema = new mongoose.Schema({ // Define sub-schema to reuse
    aptitudeTest: { type: Boolean }, // Changed to type: Boolean for simplicity based on your original
    technicalTest: { type: Boolean }, // Changed to type: Boolean
    groupDiscussion: { type: Boolean },
    personalInterview: { type: Boolean },
    numberOfRounds: { type: Number }, // Moved numberOfRounds here if it applies to PI
    provisionForWaitlist: { type: Boolean }
}, { _id: false });

const JobPostSchema = new mongoose.Schema({
    // ABOUT ORGANIZATION
    dateSubmitted: { type: Date, default: Date.now },
    organizationName: { type: String, required: true },
    website: { type: String },
    organizationType: { type: String, enum: ['Private sector', 'Start-up', 'Govt. owned', 'Public sector', 'MNC (Indian)', 'MNC (Foreign)', 'other'], required: true },
    organizationTypeOther: { type: String },

    // Industry Sector
    industrySector: { type: String, enum: [
        'Analytics', 'Consulting', 'Core (Technical)', 'Finance', 'IT',
        'Business Development', 'Sales & Mktg.', 'Management', 'Other (pls. specify)'
    ], required: true },
    industrySectorOther: { type: String },

    // JOB PROFILE
    jobDesignation: { type: String, required: true },
    jobDescription: { type: String, required: true },
    tentativeDateOfJoining: { type: Date },
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

    // PROBABLE NUMBER OF POSITIONS YOU ARE SEEKING TO FILL FROM MNIT JAIPUR
    numberOfPositions: { type: Number },

    // CANDIDATE REQUIREMENT
    cgpaRequirements: { type: String },
    medicalRequirements: { type: String },
    anyOtherRequirement: { type: String },

    // REMUNERATION PACKAGE DETAILS
    remuneration: { // Embedding the reusable schema
        btech: { type: remunerationSchema, default: {} },
        mtech: { type: remunerationSchema, default: {} },
        msc: { type: remunerationSchema, default: {} },
        mba: { type: remunerationSchema, default: {} },
        mplan: { type: remunerationSchema, default: {} },
        phd: { type: remunerationSchema, default: {} },
    },
    companyAccommodationProvided: { type: Boolean },
    serviceAgreementRequired: { type: Boolean },
    serviceAgreementDuration: { type: Number },

    // Differential Pay
    differentialPayForNITs: { type: Boolean },

    // SELECTION PROCEDURE
    preferredDatesForCampusVisit: [{ type: Date }],
    numberOfExecutivesVisiting: { type: Number },
    numberOfRoomsRequired: { type: Number },
    prePlacementTalkRequired: { type: Boolean },
    technicalPresentationRequired: { type: Boolean },

    selectionProcess: { type: selectionProcessSchema, default: {} }, // Embedding the reusable schema
    finalOfferAnnouncement: { type: String, enum: ['Same day', 'Later, but no further interviews', 'Later, after next stage of interviews'] },

    // CONTACT INFORMATION
    contactPerson: { type: String, required: true },
    emailAddress: { type: String, required: true },
    contactAddress: { type: String },
    mobileNo: { type: String },
    phone: { type: String },
    fax: { type: String },

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
}, { timestamps: true }); // timestamps: true automatically adds createdAt and updatedAt

export const JobPost = mongoose.models.JobPost || mongoose.model('JobPost', JobPostSchema);