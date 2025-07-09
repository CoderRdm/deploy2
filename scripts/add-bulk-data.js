// scripts/add-bulk-data.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// MongoDB connection
async function connectToMongoDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        return false;
    }
}

// Job Post Schema
const JobPostSchema = new mongoose.Schema({
    dateSubmitted: { type: Date, default: Date.now },
    organizationName: { type: String, required: true },
    website: { type: String },
    organizationType: { type: String, enum: ['Private sector', 'Start-up', 'Govt. owned', 'Public sector', 'MNC (Indian)', 'MNC (Foreign)', 'other'], required: true },
    industrySector: { type: String, enum: ['Analytics', 'Consulting', 'Core (Technical)', 'Finance', 'IT', 'Business Development', 'Sales & Mktg.', 'Management', 'Other (pls. specify)'], required: true },
    jobDesignation: { type: String, required: true },
    jobDescription: { type: String, required: true },
    tentativeDateOfJoining: { type: Date },
    placeOfPosting: { type: String },
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
    numberOfPositions: { type: Number },
    cgpaRequirements: { type: String },
    medicalRequirements: { type: String },
    anyOtherRequirement: { type: String },
    companyAccommodationProvided: { type: Boolean },
    serviceAgreementRequired: { type: Boolean },
    serviceAgreementDuration: { type: Number },
    differentialPayForNITs: { type: Boolean },
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
    contactPerson: { type: String, required: true },
    emailAddress: { type: String, required: true },
    contactAddress: { type: String },
    mobileNo: { type: String },
    phone: { type: String },
    fax: { type: String },
    signatureName: { type: String },
    signatureDesignation: { type: String },
    isAnnounced: { type: Boolean, default: false },
    applications: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        appliedDate: { type: Date, default: Date.now },
        status: { type: String, enum: ['Applied', 'Reviewed', 'Interview Scheduled', 'Rejected', 'Selected'], default: 'Applied' },
        coverLetter: { type: String, required: true, trim: true, minlength: [50, 'Cover letter must be at least 50 characters long'] },
        additionalInfo: { type: String, trim: true },
        eligibilityAcknowledged: { type: Boolean, required: true, default: false },
        attachments: [{ fileName: String, fileUrl: String, fileType: String, uploadDate: { type: Date, default: Date.now } }],
        submissionIp: String,
        browserInfo: String
    }]
}, { timestamps: true });

// Internship Post Schema
const InternshipPostSchema = new mongoose.Schema({
    dateSubmitted: { type: Date, default: Date.now },
    organizationName: { type: String, required: true },
    website: { type: String },
    organizationType: { type: String, enum: ['Private sector', 'Start-up', 'Govt. owned', 'Public sector', 'MNC (Indian/Foreign)', 'other'], required: true },
    industrySector: { type: String, enum: ['Analytics', 'Consulting', 'Core (Technical)', 'Finance', 'IT', 'Education', 'Sales & Mktg.', 'Management', 'Other (pls. specify)'], required: true },
    internshipProfile: { type: String, required: true },
    internshipDescription: { type: String },
    tentativeDateOfJoining: { type: Date },
    internshipDuration: { type: String },
    placeOfPosting: { type: String },
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
    numberOfPositions: { type: Number },
    cgpaRequirements: { type: String },
    studentPassingYearForInternship: [{ type: String, enum: ['1st year', '2nd year', '3rd year', '4th year', '5th year'] }],
    anyOtherRequirement: { type: String },
    remuneration: {
        btech: { other: String, stipend: Number, ctcPPO: Number },
        mtech: { other: String, stipend: Number, ctcPPO: Number },
        mba: { other: String, stipend: Number, ctcPPO: Number },
        msc: { other: String, stipend: Number, ctcPPO: Number },
        mplan: { other: String, stipend: Number, ctcPPO: Number },
        phd: { other: String, stipend: Number, ctcPPO: Number },
    },
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
    contactPerson: { type: String, required: true },
    emailAddress: { type: String, required: true },
    contactAddress: { type: String },
    mobileNo: { type: String },
    signatureName: { type: String },
    signatureDesignation: { type: String },
    isAnnounced: { type: Boolean, default: false },
    applications: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        appliedDate: { type: Date, default: Date.now },
        status: { type: String, enum: ['Applied', 'Reviewed', 'Interview Scheduled', 'Rejected', 'Selected'], default: 'Applied' },
        coverLetter: { type: String, required: true, trim: true, minlength: [50, 'Cover letter must be at least 50 characters long'] },
        additionalInfo: { type: String, trim: true },
        eligibilityAcknowledged: { type: Boolean, required: true, default: false },
        attachments: [{ fileName: String, fileUrl: String, fileType: String, uploadDate: { type: Date, default: Date.now } }],
        submissionIp: String,
        browserInfo: String
    }]
}, { timestamps: true });

const JobPost = mongoose.models.JobPost || mongoose.model('JobPost', JobPostSchema);
const InternshipPost = mongoose.models.InternshipPost || mongoose.model('InternshipPost', InternshipPostSchema);

// Comprehensive job data
const jobsData = [
    {
        organizationName: 'TechGlobal Solutions',
        website: 'https://techglobal.com',
        organizationType: 'MNC (Foreign)',
        industrySector: 'IT',
        jobDesignation: 'Full Stack Developer',
        jobDescription: 'Develop and maintain web applications using React, Node.js, and cloud technologies. Work on scalable solutions for enterprise clients.',
        tentativeDateOfJoining: new Date('2024-08-01'),
        placeOfPosting: 'Bangalore, India',
        requiredPrograms: ['B.Tech.', 'M.Tech.'],
        requiredBranches: { btech: ['Computer Science & Engineering', 'Information Technology'], mtech: ['Computer Engineering'] },
        numberOfPositions: 8,
        cgpaRequirements: 'Minimum 7.0 CGPA',
        anyOtherRequirement: 'No active backlogs. Strong knowledge of JavaScript, React, Node.js',
        contactPerson: 'Sarah Johnson',
        emailAddress: 'sarah.johnson@techglobal.com',
        mobileNo: '+91-9876543210',
        isAnnounced: true
    },
    {
        organizationName: 'DataAnalytics Pro',
        website: 'https://dataanalyticspro.com',
        organizationType: 'Start-up',
        industrySector: 'Analytics',
        jobDesignation: 'Data Scientist',
        jobDescription: 'Analyze large datasets to extract business insights using machine learning and statistical methods.',
        tentativeDateOfJoining: new Date('2024-09-15'),
        placeOfPosting: 'Hyderabad, India',
        requiredPrograms: ['B.Tech.', 'M.Sc.', 'M.Tech.'],
        requiredBranches: { 
            btech: ['Computer Science & Engineering', 'Electronics & Communication Engineering'],
            msc: ['Mathematics', 'Statistics', 'Computer Science'],
            mtech: ['Data Science', 'Computer Engineering']
        },
        numberOfPositions: 4,
        cgpaRequirements: 'Minimum 7.5 CGPA',
        anyOtherRequirement: 'Knowledge of Python, R, SQL, and machine learning frameworks',
        contactPerson: 'Dr. Rahul Sharma',
        emailAddress: 'rahul.sharma@dataanalyticspro.com',
        mobileNo: '+91-9123456789',
        isAnnounced: true
    },
    {
        organizationName: 'FinTech Innovations Ltd.',
        website: 'https://fintechinnovations.com',
        organizationType: 'Private sector',
        industrySector: 'Finance',
        jobDesignation: 'Financial Analyst',
        jobDescription: 'Analyze financial data, create reports, and support investment decisions for various financial products.',
        tentativeDateOfJoining: new Date('2024-07-20'),
        placeOfPosting: 'Mumbai, India',
        requiredPrograms: ['B.Tech.', 'MBA', 'M.Sc.'],
        requiredBranches: { 
            btech: ['Computer Science & Engineering', 'Electronics & Communication Engineering'],
            mba: ['Finance', 'Banking'],
            msc: ['Economics', 'Mathematics']
        },
        numberOfPositions: 6,
        cgpaRequirements: 'Minimum 6.8 CGPA',
        anyOtherRequirement: 'Basic knowledge of financial markets and Excel proficiency',
        contactPerson: 'Priya Mehta',
        emailAddress: 'priya.mehta@fintechinnovations.com',
        mobileNo: '+91-9987654321',
        isAnnounced: true
    },
    {
        organizationName: 'AutoMech Industries',
        website: 'https://automech.com',
        organizationType: 'MNC (Indian)',
        industrySector: 'Core (Technical)',
        jobDesignation: 'Mechanical Design Engineer',
        jobDescription: 'Design and develop mechanical components for automotive applications using CAD software.',
        tentativeDateOfJoining: new Date('2024-08-10'),
        placeOfPosting: 'Chennai, India',
        requiredPrograms: ['B.Tech.', 'M.Tech.'],
        requiredBranches: { 
            btech: ['Mechanical Engineering', 'Automobile Engineering'],
            mtech: ['Mechanical Engineering', 'Design Engineering']
        },
        numberOfPositions: 12,
        cgpaRequirements: 'Minimum 6.5 CGPA',
        anyOtherRequirement: 'Proficiency in AutoCAD, SolidWorks, or similar CAD software',
        contactPerson: 'Rajesh Kumar',
        emailAddress: 'rajesh.kumar@automech.com',
        mobileNo: '+91-9876543200',
        isAnnounced: true
    },
    {
        organizationName: 'EcoGreen Consulting',
        website: 'https://ecogreen.com',
        organizationType: 'Private sector',
        industrySector: 'Consulting',
        jobDesignation: 'Environmental Consultant',
        jobDescription: 'Provide environmental consulting services for industrial projects and sustainability initiatives.',
        tentativeDateOfJoining: new Date('2024-09-01'),
        placeOfPosting: 'Delhi, India',
        requiredPrograms: ['B.Tech.', 'M.Tech.', 'M.Sc.'],
        requiredBranches: { 
            btech: ['Environmental Engineering', 'Civil Engineering'],
            mtech: ['Environmental Engineering'],
            msc: ['Environmental Science', 'Chemistry']
        },
        numberOfPositions: 5,
        cgpaRequirements: 'Minimum 7.0 CGPA',
        anyOtherRequirement: 'Knowledge of environmental regulations and impact assessment',
        contactPerson: 'Dr. Anita Singh',
        emailAddress: 'anita.singh@ecogreen.com',
        mobileNo: '+91-9654321098',
        isAnnounced: true
    },
    {
        organizationName: 'PowerGrid Solutions',
        website: 'https://powergrid.com',
        organizationType: 'Govt. owned',
        industrySector: 'Core (Technical)',
        jobDesignation: 'Electrical Engineer',
        jobDescription: 'Design and maintain electrical power systems and grid infrastructure.',
        tentativeDateOfJoining: new Date('2024-08-15'),
        placeOfPosting: 'Various locations across India',
        requiredPrograms: ['B.Tech.', 'M.Tech.'],
        requiredBranches: { 
            btech: ['Electrical Engineering', 'Electronics & Communication Engineering'],
            mtech: ['Power Systems', 'Electrical Engineering']
        },
        numberOfPositions: 15,
        cgpaRequirements: 'Minimum 6.0 CGPA',
        anyOtherRequirement: 'Knowledge of power systems and electrical safety protocols',
        contactPerson: 'Suresh Reddy',
        emailAddress: 'suresh.reddy@powergrid.com',
        mobileNo: '+91-9123456780',
        isAnnounced: true
    }
];

// Comprehensive internship data
const internshipsData = [
    {
        organizationName: 'TechStartup Labs',
        website: 'https://techstartuplabs.com',
        organizationType: 'Start-up',
        industrySector: 'IT',
        internshipProfile: 'Web Development Intern',
        internshipDescription: 'Work on building modern web applications using React, Node.js, and database technologies. Get hands-on experience with full-stack development.',
        tentativeDateOfJoining: new Date('2024-06-01'),
        internshipDuration: '3 months',
        placeOfPosting: 'Bangalore, India',
        requiredPrograms: ['B.Tech.', 'M.Tech.', 'M.Sc.'],
        requiredBranches: { 
            btech: ['Computer Science & Engineering', 'Information Technology'],
            mtech: ['Computer Engineering'],
            msc: ['Computer Science']
        },
        numberOfPositions: 6,
        cgpaRequirements: 'Minimum 6.5 CGPA',
        studentPassingYearForInternship: ['2nd year', '3rd year'],
        anyOtherRequirement: 'Basic knowledge of HTML, CSS, JavaScript',
        remuneration: {
            btech: { stipend: 20000, ctcPPO: 1000000, other: 'Free meals and transport allowance' },
            mtech: { stipend: 25000, ctcPPO: 1200000, other: 'Free meals and transport allowance' },
            msc: { stipend: 18000, ctcPPO: 900000, other: 'Free meals and transport allowance' }
        },
        contactPerson: 'Arjun Patel',
        emailAddress: 'arjun.patel@techstartuplabs.com',
        mobileNo: '+91-9876543211',
        isAnnounced: true
    },
    {
        organizationName: 'DataInsights Corporation',
        website: 'https://datainsights.com',
        organizationType: 'MNC (Indian/Foreign)',
        industrySector: 'Analytics',
        internshipProfile: 'Data Analytics Intern',
        internshipDescription: 'Analyze business data to generate insights and create visualizations using Python, R, and Tableau.',
        tentativeDateOfJoining: new Date('2024-05-20'),
        internshipDuration: '4 months',
        placeOfPosting: 'Pune, India',
        requiredPrograms: ['B.Tech.', 'M.Sc.', 'M.Tech.'],
        requiredBranches: { 
            btech: ['Computer Science & Engineering', 'Electronics & Communication Engineering'],
            msc: ['Statistics', 'Mathematics', 'Computer Science'],
            mtech: ['Data Science', 'Computer Engineering']
        },
        numberOfPositions: 4,
        cgpaRequirements: 'Minimum 7.0 CGPA',
        studentPassingYearForInternship: ['3rd year', '4th year'],
        anyOtherRequirement: 'Knowledge of Python/R and basic statistics',
        remuneration: {
            btech: { stipend: 22000, ctcPPO: 1100000, other: 'Certification and project bonus' },
            msc: { stipend: 20000, ctcPPO: 1000000, other: 'Certification and project bonus' },
            mtech: { stipend: 28000, ctcPPO: 1300000, other: 'Certification and project bonus' }
        },
        contactPerson: 'Dr. Emily Watson',
        emailAddress: 'emily.watson@datainsights.com',
        mobileNo: '+91-9123456782',
        isAnnounced: true
    },
    {
        organizationName: 'GreenTech Solutions',
        website: 'https://greentechsolutions.com',
        organizationType: 'Private sector',
        industrySector: 'Core (Technical)',
        internshipProfile: 'Environmental Engineering Intern',
        internshipDescription: 'Support environmental impact assessments and sustainability projects for industrial clients.',
        tentativeDateOfJoining: new Date('2024-06-15'),
        internshipDuration: '3 months',
        placeOfPosting: 'Hyderabad, India',
        requiredPrograms: ['B.Tech.', 'M.Tech.', 'M.Sc.'],
        requiredBranches: { 
            btech: ['Environmental Engineering', 'Civil Engineering', 'Chemical Engineering'],
            mtech: ['Environmental Engineering'],
            msc: ['Environmental Science', 'Chemistry']
        },
        numberOfPositions: 3,
        cgpaRequirements: 'Minimum 6.8 CGPA',
        studentPassingYearForInternship: ['3rd year', '4th year'],
        anyOtherRequirement: 'Interest in environmental sustainability and green technologies',
        remuneration: {
            btech: { stipend: 18000, ctcPPO: 950000, other: 'Field work allowance' },
            mtech: { stipend: 23000, ctcPPO: 1150000, other: 'Field work allowance' },
            msc: { stipend: 16000, ctcPPO: 850000, other: 'Field work allowance' }
        },
        contactPerson: 'Kavya Nair',
        emailAddress: 'kavya.nair@greentechsolutions.com',
        mobileNo: '+91-9987654322',
        isAnnounced: true
    },
    {
        organizationName: 'Robo Innovations',
        website: 'https://roboinnovations.com',
        organizationType: 'Start-up',
        industrySector: 'Core (Technical)',
        internshipProfile: 'Robotics Engineering Intern',
        internshipDescription: 'Work on robotics projects involving hardware design, programming, and automation systems.',
        tentativeDateOfJoining: new Date('2024-07-01'),
        internshipDuration: '2 months',
        placeOfPosting: 'Chennai, India',
        requiredPrograms: ['B.Tech.', 'M.Tech.'],
        requiredBranches: { 
            btech: ['Mechanical Engineering', 'Electronics & Communication Engineering', 'Computer Science & Engineering'],
            mtech: ['Robotics', 'Automation', 'Mechanical Engineering']
        },
        numberOfPositions: 5,
        cgpaRequirements: 'Minimum 7.2 CGPA',
        studentPassingYearForInternship: ['2nd year', '3rd year', '4th year'],
        anyOtherRequirement: 'Basic programming knowledge (C++, Python) and interest in robotics',
        remuneration: {
            btech: { stipend: 25000, ctcPPO: 1200000, other: 'Project completion bonus' },
            mtech: { stipend: 30000, ctcPPO: 1400000, other: 'Project completion bonus' }
        },
        contactPerson: 'Vikram Singh',
        emailAddress: 'vikram.singh@roboinnovations.com',
        mobileNo: '+91-9654321087',
        isAnnounced: true
    },
    {
        organizationName: 'EduTech Learning',
        website: 'https://edutechlearning.com',
        organizationType: 'Private sector',
        industrySector: 'Education',
        internshipProfile: 'Educational Technology Intern',
        internshipDescription: 'Develop educational content and digital learning platforms for K-12 and higher education.',
        tentativeDateOfJoining: new Date('2024-05-30'),
        internshipDuration: '3 months',
        placeOfPosting: 'Mumbai, India',
        requiredPrograms: ['B.Tech.', 'M.Tech.', 'M.Sc.', 'MBA'],
        requiredBranches: { 
            btech: ['Computer Science & Engineering', 'Information Technology'],
            mtech: ['Computer Engineering', 'Software Engineering'],
            msc: ['Computer Science', 'Education'],
            mba: ['Marketing', 'Operations']
        },
        numberOfPositions: 4,
        cgpaRequirements: 'Minimum 6.5 CGPA',
        studentPassingYearForInternship: ['2nd year', '3rd year', '4th year'],
        anyOtherRequirement: 'Interest in education technology and content development',
        remuneration: {
            btech: { stipend: 19000, ctcPPO: 980000, other: 'Learning materials provided' },
            mtech: { stipend: 24000, ctcPPO: 1180000, other: 'Learning materials provided' },
            msc: { stipend: 17000, ctcPPO: 880000, other: 'Learning materials provided' },
            mba: { stipend: 26000, ctcPPO: 1250000, other: 'Learning materials provided' }
        },
        contactPerson: 'Sneha Gupta',
        emailAddress: 'sneha.gupta@edutechlearning.com',
        mobileNo: '+91-9123456783',
        isAnnounced: true
    }
];

async function addBulkData() {
    const connected = await connectToMongoDB();
    if (!connected) {
        process.exit(1);
    }

    try {
        console.log('\n🚀 Starting bulk data insertion...\n');

        // Add Jobs
        console.log('📋 Adding Job Posts...');
        let jobsAdded = 0;
        for (const jobData of jobsData) {
            const existingJob = await JobPost.findOne({
                organizationName: jobData.organizationName,
                jobDesignation: jobData.jobDesignation
            });

            if (!existingJob) {
                const newJob = new JobPost(jobData);
                await newJob.save();
                console.log(`✅ Added: ${jobData.jobDesignation} at ${jobData.organizationName}`);
                jobsAdded++;
            } else {
                console.log(`⏭️  Skipped: ${jobData.jobDesignation} at ${jobData.organizationName} (already exists)`);
            }
        }

        // Add Internships
        console.log('\n🎓 Adding Internship Posts...');
        let internshipsAdded = 0;
        for (const internshipData of internshipsData) {
            const existingInternship = await InternshipPost.findOne({
                organizationName: internshipData.organizationName,
                internshipProfile: internshipData.internshipProfile
            });

            if (!existingInternship) {
                const newInternship = new InternshipPost(internshipData);
                await newInternship.save();
                console.log(`✅ Added: ${internshipData.internshipProfile} at ${internshipData.organizationName}`);
                internshipsAdded++;
            } else {
                console.log(`⏭️  Skipped: ${internshipData.internshipProfile} at ${internshipData.organizationName} (already exists)`);
            }
        }

        // Summary
        console.log('\n📊 Summary:');
        console.log(`✅ Jobs added: ${jobsAdded}/${jobsData.length}`);
        console.log(`✅ Internships added: ${internshipsAdded}/${internshipsData.length}`);
        console.log(`🎯 Total new entries: ${jobsAdded + internshipsAdded}`);

        console.log('\n🔗 Next Steps:');
        console.log('1. Login as a student to view the new announcements');
        console.log('2. Test the eligibility checker with different student profiles');
        console.log('3. Try applying for jobs and internships to test the application system');

    } catch (error) {
        console.error('❌ Error adding bulk data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the script
addBulkData();
