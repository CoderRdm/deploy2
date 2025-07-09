// src/lib/models/Student.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the RedFlag sub-schema
const redFlagSchema = new mongoose.Schema({
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    assignedBy: { // To track which SPC/Admin assigned it
        type: String, // Store SPC's name or email (from session.user.name/email)
        required: true,
        trim: true,
    },
    assignedById: { // To track SPC's user ID (from session.user.studentId or admin ID)
        type: String, // Store the student_id if SPC, or Admin _id if Admin
        required: true,
        trim: true,
    },
    // You could add severity, dateResolved, etc. here
}, { timestamps: true }); // Each red flag will have its own createdAt/updatedAt

const studentSchema = new mongoose.Schema({
    student_id: { // Your custom student ID (e.g., "STU_12345")
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String
    },
    year: {
        type: String,
        // --- MODIFIED ENUM: Added numeric strings to allow existing '1', '2' etc. ---
        // IMPORTANT: The error showed '1' (numeric). If your DB has actual numbers,
        // you might need to convert them to strings in DB or consider a mixed type,
        // but '1', '2' as strings are compatible with this enum.
        enum: ['1st', '2nd', '3rd', '4th', 'Alumni', '1', '2', '3', '4'],
        default: '1st'
    },
    branch: {
        type: String,
        enum: [
            // Short forms (existing data compatibility)
            'CSE', 'IT', 'ECE', 'EEE', 'EE', 'Civil', 'Mechanical', 'TBD', 'Electrical',
            // Full forms (job post compatibility)
            'Computer Science & Engineering', 'Information Technology', 
            'Electronics & Communication Engineering', 'Electrical Engineering',
            'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering',
            'Automobile Engineering', 'Environmental Engineering', 'Design Engineering',
            // Additional branches
            'Biotechnology', 'Aerospace Engineering', 'Petroleum Engineering',
            'Mining Engineering', 'Metallurgy', 'Production Engineering',
            'Industrial Engineering', 'Agricultural Engineering'
        ],
        default: 'CSE', 
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    tenth_score: {
        type: Number,
        min: 0,
        max: 100
    },
    twelfth_score: {
        type: Number,
        min: 0,
        max: 100
    },
    father_name: {
        type: String,
        trim: true
    },
    current_semester: {
        type: Number,
        min: 1,
        max: 8
    },
    dob: {
        type: Date,
    },
    // --- CGPA SECTION ---
    cgpa: {
        overall: {
            type: Number,
            min: 0,
            max: 10,
            default: 0
        },
        semester_wise: [{
            semester: {
                type: Number,
                required: true,
                min: 1,
                max: 8
            },
            sgpa: {
                type: Number,
                required: true,
                min: 0,
                max: 10
            },
            credits_earned: {
                type: Number,
                min: 0,
                default: 0
            },
            backlogs: {
                type: Number,
                min: 0,
                default: 0
            }
        }],
        total_backlogs: {
            type: Number,
            min: 0,
            default: 0
        },
        active_backlogs: {
            type: Number,
            min: 0,
            default: 0
        },
        credits_completed: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    profile_completed: {
        type: Boolean,
        default: false,
    },
    // --- UPDATED RED FLAGS FIELD ---
    redflags: {
        type: [redFlagSchema], // Array of redFlagSchema objects
        default: []
    },
    // --- NEW: SPC role flag for students ---
    isSPC: {
        type: Boolean,
        default: false,
    },
    // --- NEW: Placement availability for current season ---
    availableForPlacement: {
        type: Boolean,
        default: false,
    },
    placementAvailabilityUpdatedAt: {
        type: Date,
        default: null,
    },
    // Resume and document management
    resume: {
        fileName: {
            type: String,
            default: null
        },
        originalName: {
            type: String,
            default: null
        },
        fileSize: {
            type: Number,
            default: null
        },
        uploadedAt: {
            type: Date,
            default: null
        },
        url: {
            type: String,
            default: null
        }
    },
    profilePicture: {
        fileName: {
            type: String,
            default: null
        },
        originalName: {
            type: String,
            default: null
        },
        fileSize: {
            type: Number,
            default: null
        },
        uploadedAt: {
            type: Date,
            default: null
        },
        url: {
            type: String,
            default: null
        }
    },
    // Additional fields
    phone_number: {
        type: String,
        trim: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    // Enhanced company applications and placements tracking
    companyApplications: {
        jobs: [{
            postId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'JobPost',
                required: true
            },
            companyName: {
                type: String,
                required: true,
                trim: true
            },
            position: {
                type: String,
                required: true,
                trim: true
            },
            appliedDate: {
                type: Date,
                required: true,
                default: Date.now
            },
            currentStatus: {
                type: String,
                enum: ['Applied', 'Reviewed', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn'],
                default: 'Applied'
            },
            statusHistory: [{
                status: {
                    type: String,
                    enum: ['Applied', 'Reviewed', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn'],
                    required: true
                },
                updatedDate: {
                    type: Date,
                    required: true,
                    default: Date.now
                },
                updatedBy: {
                    type: String,
                    trim: true
                },
                notes: {
                    type: String,
                    trim: true
                }
            }],
            coverLetter: {
                type: String,
                trim: true
            },
            additionalInfo: {
                type: String,
                trim: true
            },
            interviewDetails: {
                date: Date,
                time: String,
                venue: String,
                interviewType: {
                    type: String,
                    enum: ['Technical', 'HR', 'Group Discussion', 'Aptitude Test', 'Final Round']
                },
                notes: String
            },
            offerDetails: {
                offered: {
                    type: Boolean,
                    default: false
                },
                ctc: Number,
                joiningDate: Date,
                offerLetterReceived: {
                    type: Boolean,
                    default: false
                },
                accepted: {
                    type: Boolean,
                    default: false
                }
            }
        }],
        internships: [{
            postId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'InternshipPost',
                required: true
            },
            companyName: {
                type: String,
                required: true,
                trim: true
            },
            position: {
                type: String,
                required: true,
                trim: true
            },
            appliedDate: {
                type: Date,
                required: true,
                default: Date.now
            },
            currentStatus: {
                type: String,
                enum: ['Applied', 'Reviewed', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn'],
                default: 'Applied'
            },
            statusHistory: [{
                status: {
                    type: String,
                    enum: ['Applied', 'Reviewed', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn'],
                    required: true
                },
                updatedDate: {
                    type: Date,
                    required: true,
                    default: Date.now
                },
                updatedBy: {
                    type: String,
                    trim: true
                },
                notes: {
                    type: String,
                    trim: true
                }
            }],
            coverLetter: {
                type: String,
                trim: true
            },
            additionalInfo: {
                type: String,
                trim: true
            },
            duration: {
                type: String,
                trim: true
            },
            stipend: Number,
            interviewDetails: {
                date: Date,
                time: String,
                venue: String,
                interviewType: {
                    type: String,
                    enum: ['Technical', 'HR', 'Group Discussion', 'Aptitude Test', 'Final Round']
                },
                notes: String
            },
            offerDetails: {
                offered: {
                    type: Boolean,
                    default: false
                },
                stipend: Number,
                startDate: Date,
                endDate: Date,
                ppoOffered: {
                    type: Boolean,
                    default: false
                },
                ppoCtc: Number,
                offerLetterReceived: {
                    type: Boolean,
                    default: false
                },
                accepted: {
                    type: Boolean,
                    default: false
                }
            }
        }]
    },
    
    // Final placements and internship completions
    placements: {
        finalJob: {
            companyName: {
                type: String,
                trim: true
            },
            position: {
                type: String,
                trim: true
            },
            ctc: Number,
            joiningDate: Date,
            workLocation: {
                type: String,
                trim: true
            },
            offerType: {
                type: String,
                enum: ['Regular', 'PPO', 'Lateral']
            },
            placedDate: {
                type: Date,
                default: Date.now
            },
            isCurrentJob: {
                type: Boolean,
                default: true
            }
        },
        internshipsCompleted: [{
            companyName: {
                type: String,
                required: true,
                trim: true
            },
            position: {
                type: String,
                required: true,
                trim: true
            },
            duration: {
                type: String,
                trim: true
            },
            startDate: Date,
            endDate: Date,
            stipend: Number,
            completionStatus: {
                type: String,
                enum: ['Completed', 'Ongoing', 'Discontinued'],
                default: 'Completed'
            },
            ppoReceived: {
                type: Boolean,
                default: false
            },
            ppoCtc: Number,
            ppoAccepted: {
                type: Boolean,
                default: false
            },
            certificateReceived: {
                type: Boolean,
                default: false
            },
            performanceRating: {
                type: String,
                enum: ['Excellent', 'Good', 'Average', 'Below Average']
            },
            feedback: {
                type: String,
                trim: true
            }
        }]
    },
    

}, { timestamps: true });

// Pre-save hook to hash password before saving
studentSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.password) { // Added this.password check for robustness
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to compare password (for login)
studentSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to calculate overall CGPA from semester-wise SGPA
studentSchema.methods.calculateOverallCGPA = function() {
    if (!this.cgpa.semester_wise || this.cgpa.semester_wise.length === 0) {
        return 0;
    }
    
    let totalWeightedGPA = 0;
    let totalCredits = 0;
    
    this.cgpa.semester_wise.forEach(sem => {
        if (sem.credits_earned && sem.sgpa) {
            totalWeightedGPA += sem.sgpa * sem.credits_earned;
            totalCredits += sem.credits_earned;
        }
    });
    
    return totalCredits > 0 ? (totalWeightedGPA / totalCredits).toFixed(2) : 0;
};

// Pre-save hook to update overall CGPA
studentSchema.pre('save', async function (next) {
    if (this.isModified('cgpa.semester_wise')) {
        this.cgpa.overall = this.calculateOverallCGPA();
        
        // Calculate total credits completed
        this.cgpa.credits_completed = this.cgpa.semester_wise.reduce((total, sem) => {
            return total + (sem.credits_earned || 0);
        }, 0);
        
        // Calculate total backlogs
        this.cgpa.total_backlogs = this.cgpa.semester_wise.reduce((total, sem) => {
            return total + (sem.backlogs || 0);
        }, 0);
    }
    next();
});

export const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);