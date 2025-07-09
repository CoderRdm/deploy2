// scripts/create-test-job.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Import the JobPost model
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

    selectionProcess: {
        aptitudeTest: { type: Boolean },
        technicalTest: { type: Boolean },
        groupDiscussion: { type: Boolean },
        personalInterview: { type: Boolean },
        numberOfRounds: { type: Number },
        provisionForWaitlist: { type: Boolean }
    },
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

const JobPost = mongoose.models.JobPost || mongoose.model('JobPost', JobPostSchema);

async function createTestJob() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Create a comprehensive test job post
        const testJobData = {
            organizationName: 'TechCorp Solutions Ltd.',
            website: 'https://techcorp.com',
            organizationType: 'MNC (Foreign)',
            industrySector: 'IT',
            jobDesignation: 'Software Development Engineer',
            jobDescription: `We are looking for passionate Software Development Engineers to join our dynamic team. 

Role & Responsibilities:
• Design and develop scalable web applications using modern technologies
• Collaborate with cross-functional teams to deliver high-quality software solutions
• Participate in code reviews and maintain coding standards
• Work on challenging problems in areas like distributed systems, machine learning, and cloud computing

What we offer:
• Competitive compensation package
• Opportunity to work with cutting-edge technologies
• Mentorship from industry experts
• Flexible work environment and growth opportunities

Join us in building the next generation of software solutions that impact millions of users worldwide.`,
            tentativeDateOfJoining: new Date('2024-07-01'),
            placeOfPosting: 'Bangalore, India',
            
            requiredPrograms: ['B.Tech.', 'M.Tech.'],
            requiredBranches: {
                btech: ['CSE', 'IT', 'ECE'],
                mtech: ['CSE', 'IT'],
                allBranchesApplicable: false
            },
            
            numberOfPositions: 5,
            cgpaRequirements: 'Minimum 7.5 CGPA in B.Tech/M.Tech',
            medicalRequirements: 'Normal vision and hearing. No specific medical restrictions.',
            anyOtherRequirement: 'No active backlogs. Strong programming skills in at least one language (Java, Python, C++, JavaScript). Good understanding of data structures and algorithms.',
            
            companyAccommodationProvided: true,
            serviceAgreementRequired: true,
            serviceAgreementDuration: 2,
            differentialPayForNITs: false,
            
            preferredDatesForCampusVisit: [new Date('2024-03-15'), new Date('2024-03-16')],
            numberOfExecutivesVisiting: 3,
            numberOfRoomsRequired: 2,
            prePlacementTalkRequired: true,
            technicalPresentationRequired: false,
            
            selectionProcess: {
                aptitudeTest: true,
                technicalTest: true,
                groupDiscussion: false,
                personalInterview: true,
                numberOfRounds: 2,
                provisionForWaitlist: true
            },
            finalOfferAnnouncement: 'Same day',
            
            contactPerson: 'John Smith',
            emailAddress: 'john.smith@techcorp.com',
            contactAddress: '123 Tech Street, Bangalore, Karnataka, India - 560001',
            mobileNo: '+91-9876543210',
            phone: '+91-80-12345678',
            
            signatureName: 'John Smith',
            signatureDesignation: 'Senior HR Manager',
            
            isAnnounced: true // Make it available for students to see
        };

        // Check if a similar job already exists
        const existingJob = await JobPost.findOne({ 
            organizationName: testJobData.organizationName,
            jobDesignation: testJobData.jobDesignation 
        });

        if (existingJob) {
            console.log('📋 Test job already exists:', existingJob.jobDesignation, 'at', existingJob.organizationName);
            console.log('🆔 Job ID:', existingJob._id);
            return;
        }

        // Create the job post
        const newJob = new JobPost(testJobData);
        await newJob.save();

        console.log('✅ Test job created successfully!');
        console.log('📋 Job Title:', newJob.jobDesignation);
        console.log('🏢 Company:', newJob.organizationName);
        console.log('🆔 Job ID:', newJob._id);
        console.log('📅 Created at:', newJob.createdAt);
        console.log('');
        console.log('🔗 You can now test the enhanced application system by:');
        console.log('   1. Login as a student');
        console.log('   2. Go to Student → Announcements');
        console.log('   3. Click on the job posting');
        console.log('   4. Test the eligibility checker and application form');

    } catch (error) {
        console.error('❌ Error creating test job:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the script
async function createMultipleJobs() {
    const jobsData = [
        {
            organizationName: 'TechNova Solutions',
            website: 'https://technova.com',
            organizationType: 'Start-up',
            industrySector: 'Analytics',
            jobDesignation: 'Data Analyst',
            jobDescription: 'Analyze data to support decision making and business insights.',
            tentativeDateOfJoining: new Date('2024-08-01'),
            placeOfPosting: 'Hyderabad, India',
            requiredPrograms: ['B.Tech.', 'M.Sc.'],
            requiredBranches: { allBranchesApplicable: true },
            numberOfPositions: 3,
            cgpaRequirements: 'Minimum 6.5 CGPA',
            contactPerson: 'Alex Johnson',
            emailAddress: 'alex.johnson@technova.com',
            mobileNo: '+91-9876543200',
            isAnnounced: true
        },
        {
            organizationName: 'InnoCreate Pvt. Ltd.',
            website: 'https://innocreate.com',
            organizationType: 'MNC (Indian)',
            industrySector: 'Core (Technical)',
            jobDesignation: 'Mechanical Engineer',
            jobDescription: 'Work on innovative product designs and mechanical solutions.',
            tentativeDateOfJoining: new Date('2024-09-15'),
            placeOfPosting: 'Chennai, India',
            requiredPrograms: ['B.Tech.'],
            requiredBranches: { btech: ['Mechanical Engineering'] },
            numberOfPositions: 10,
            cgpaRequirements: 'Minimum 7.0 CGPA',
            contactPerson: 'Nina Patel',
            emailAddress: 'nina.patel@innocreate.com',
            mobileNo: '+91-9123456789',
            isAnnounced: true
        }
    ];

    try {
        for (const jobData of jobsData) {
            const existingJob = await JobPost.findOne({
                organizationName: jobData.organizationName,
                jobDesignation: jobData.jobDesignation
            });

            if (!existingJob) {
                const newJob = new JobPost(jobData);
                await newJob.save();
                console.log('✅ Job created:', newJob.jobDesignation, 'at', newJob.organizationName);
            }
        }
        console.log('🔗 Finished creating multiple jobs.');
    } catch (error) {
        console.error('❌ Error creating jobs:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

createMultipleJobs();
