// scripts/create-test-internship.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Import the InternshipPost model
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
    internshipDescription: { type: String },
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
        btech: { other: String, stipend: Number, ctcPPO: Number },
        mtech: { other: String, stipend: Number, ctcPPO: Number },
        mba: { other: String, stipend: Number, ctcPPO: Number },
        msc: { other: String, stipend: Number, ctcPPO: Number },
        mplan: { other: String, stipend: Number, ctcPPO: Number },
        phd: { other: String, stipend: Number, ctcPPO: Number },
    },

    // SELECTION PROCEDURE
    preferredDatesForCampusVisit: [{ type: Date }],
    numberOfExecutivesVisiting: { type: Number },
    numberOfRoomsRequired: { type: Number },
    prePlacementTalkRequired: { type: Boolean },
    selectionProcess: {
        aptitudeTest: { type: Boolean },
        technicalTest: { type: Boolean },
        groupDiscussion: { type: Boolean },
        personalInterview: { type: Boolean },
        provisionForWaitlist: { type: Boolean }
    },
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
            required: true,
            trim: true,
            minlength: [50, 'Cover letter must be at least 50 characters long']
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

const InternshipPost = mongoose.models.InternshipPost || mongoose.model('InternshipPost', InternshipPostSchema);

async function createTestInternship() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Create a comprehensive test internship post
        const testInternshipData = {
            organizationName: 'TechInnovate Solutions Pvt. Ltd.',
            website: 'https://techinnovate.com',
            organizationType: 'Start-up',
            industrySector: 'IT',
            internshipProfile: 'Software Development Intern',
            internshipDescription: `We are seeking motivated and talented Software Development Interns to join our dynamic team during the summer period.

Role & Responsibilities:
• Develop and maintain web applications using modern frameworks like React, Node.js
• Collaborate with senior developers on real-world projects
• Participate in code reviews and follow best coding practices
• Work on database design and API development
• Learn about software architecture and system design
• Contribute to open-source projects and documentation

What we offer:
• Competitive stipend and potential for PPO
• Mentorship from experienced software engineers
• Hands-on experience with cutting-edge technologies
• Flexible work environment and learning opportunities
• Certificate of completion and recommendation letters

This internship provides an excellent opportunity to gain practical experience in software development while working on projects that impact real users.`,
            tentativeDateOfJoining: new Date('2024-05-15'),
            internshipDuration: '2-3 months (Summer Internship)',
            placeOfPosting: 'Pune, Maharashtra (with remote work options)',
            
            requiredPrograms: ['B.Tech.', 'M.Tech.', 'M.Sc.'],
            requiredBranches: {
                btech: ['Computer Science & Engineering', 'Electronics & Communication Engineering', 'Electrical Engineering'],
                mtech: ['Computer Engineering', 'Software Engineering'],
                msc: ['Computer Science', 'Information Technology'],
                allBranchesApplicable: false
            },
            
            numberOfPositions: 8,
            cgpaRequirements: 'Minimum 7.0 CGPA in current program',
            studentPassingYearForInternship: ['2nd year', '3rd year'],
            anyOtherRequirement: 'No active backlogs. Basic programming knowledge in at least one language (Python, Java, C++, JavaScript). Interest in web development and software engineering.',
            
            remuneration: {
                btech: { 
                    stipend: 25000, 
                    ctcPPO: 1200000, 
                    other: 'Accommodation assistance provided' 
                },
                mtech: { 
                    stipend: 30000, 
                    ctcPPO: 1500000, 
                    other: 'Accommodation assistance provided' 
                },
                msc: { 
                    stipend: 25000, 
                    ctcPPO: 1100000, 
                    other: 'Accommodation assistance provided' 
                }
            },
            
            preferredDatesForCampusVisit: [new Date('2024-04-10'), new Date('2024-04-11')],
            numberOfExecutivesVisiting: 2,
            numberOfRoomsRequired: 1,
            prePlacementTalkRequired: true,
            
            selectionProcess: {
                aptitudeTest: false,
                technicalTest: true,
                groupDiscussion: true,
                personalInterview: true,
                provisionForWaitlist: true
            },
            finalOfferAnnouncement: 'Same day',
            
            contactPerson: 'Priya Sharma',
            emailAddress: 'priya.sharma@techinnovate.com',
            contactAddress: 'TechInnovate Solutions, Tech Park Phase 2, Pune, Maharashtra - 411057',
            mobileNo: '+91-9876543210',
            
            signatureName: 'Priya Sharma',
            signatureDesignation: 'HR Manager',
            
            isAnnounced: true // Make it available for students to see
        };

        // Check if a similar internship already exists
        const existingInternship = await InternshipPost.findOne({ 
            organizationName: testInternshipData.organizationName,
            internshipProfile: testInternshipData.internshipProfile 
        });

        if (existingInternship) {
            console.log('📋 Test internship already exists:', existingInternship.internshipProfile, 'at', existingInternship.organizationName);
            console.log('🆔 Internship ID:', existingInternship._id);
            return;
        }

        // Create the internship post
        const newInternship = new InternshipPost(testInternshipData);
        await newInternship.save();

        console.log('✅ Test internship created successfully!');
        console.log('📋 Internship Title:', newInternship.internshipProfile);
        console.log('🏢 Company:', newInternship.organizationName);
        console.log('🆔 Internship ID:', newInternship._id);
        console.log('📅 Created at:', newInternship.createdAt);
        console.log('💰 Stipend (B.Tech):', `₹${newInternship.remuneration.btech.stipend}/month`);
        console.log('');
        console.log('🔗 You can now test the enhanced internship application system by:');
        console.log('   1. Login as a student');
        console.log('   2. Go to Student → Announcements');
        console.log('   3. Click on the internship posting');
        console.log('   4. Test the eligibility checker and application form');

    } catch (error) {
        console.error('❌ Error creating test internship:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the script
async function createMultipleInternships() {
    const internshipsData = [
        {
            organizationName: 'FutureTech Innovations',
            website: 'https://futuretech.com',
            organizationType: 'Govt. owned',
            industrySector: 'Education',
            internshipProfile: 'Research Intern',
            internshipDescription: 'Assist in research and development of educational technologies.',
            tentativeDateOfJoining: new Date('2024-06-10'),
            internshipDuration: '3 months',
            placeOfPosting: 'Delhi, India',
            requiredPrograms: ['M.Tech.', 'Ph.D.'],
            requiredBranches: { mtech: ['Education Technology'], phd: ['Education'] },
            numberOfPositions: 5,
            cgpaRequirements: 'Minimum 7.5 CGPA',
            studentPassingYearForInternship: ['3rd year', 'Final year'],
            contactPerson: 'Dr. Sara Malik',
            emailAddress: 'sara.malik@futuretech.com',
            mobileNo: '+91-9812345678',
            isAnnounced: true
        },
        {
            organizationName: 'GreenTech Eco Solutions',
            website: 'https://greentech.com',
            organizationType: 'MNC (Foreign)',
            industrySector: 'Consulting',
            internshipProfile: 'Environmental Consultant Intern',
            internshipDescription: 'Support environmental consultancy projects and sustainability initiatives.',
            tentativeDateOfJoining: new Date('2024-07-15'),
            internshipDuration: '4 months',
            placeOfPosting: 'Mumbai, India',
            requiredPrograms: ['B.Tech.', 'M.Sc.'],
            requiredBranches: { btech: ['Environmental Engineering'], msc: ['Environmental Science'] },
            numberOfPositions: 4,
            cgpaRequirements: 'Minimum 7.0 CGPA',
            studentPassingYearForInternship: ['Final year'],
            contactPerson: 'Emma Wilson',
            emailAddress: 'emma.wilson@greentech.com',
            mobileNo: '+91-9823456789',
            isAnnounced: true
        }
    ];

    try {
        for (const internshipData of internshipsData) {
            const existingInternship = await InternshipPost.findOne({
                organizationName: internshipData.organizationName,
                internshipProfile: internshipData.internshipProfile
            });

            if (!existingInternship) {
                const newInternship = new InternshipPost(internshipData);
                await newInternship.save();
                console.log('✅ Internship created:', newInternship.internshipProfile, 'at', newInternship.organizationName);
            }
        }
        console.log('🔗 Finished creating multiple internships.');
    } catch (error) {
        console.error('❌ Error creating internships:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

createMultipleInternships();
