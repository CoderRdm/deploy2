// scripts/fix-recruiter-emails.js
// Script to fix email mismatches between recruiters and their posts

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Database connection
const connectToDb = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully!');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

// Import models
const recruiterSchema = new mongoose.Schema({
    first_name: { type: String, required: true, maxlength: 50 },
    last_name: { type: String, required: true, maxlength: 50 },
    email: { type: String, required: true, unique: true },
    phone: { type: String, minlength: 10, maxlength: 15 },
    company: {
        name: { type: String, required: true },
        address: String,
        website: String,
        industry: String,
        description: String
    }
}, { timestamps: true });

const jobPostSchema = new mongoose.Schema({
    organizationName: { type: String, required: true },
    website: { type: String },
    organizationType: { type: String, required: true },
    industrySector: { type: String, required: true },
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
    anyOtherRequirement: { type: String },
    contactPerson: { type: String, required: true },
    emailAddress: { type: String, required: true },
    contactAddress: { type: String },
    mobileNo: { type: String },
    phone: { type: String },
    isAnnounced: { type: Boolean, default: false },
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

const internshipPostSchema = new mongoose.Schema({
    organizationName: { type: String, required: true },
    website: { type: String },
    organizationType: { type: String, required: true },
    industrySector: { type: String, required: true },
    internshipProfile: { type: String, required: true },
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
    anyOtherRequirement: { type: String },
    contactPerson: { type: String, required: true },
    emailAddress: { type: String, required: true },
    contactAddress: { type: String },
    mobileNo: { type: String },
    isAnnounced: { type: Boolean, default: false },
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

const Recruiter = mongoose.models.Recruiter || mongoose.model('Recruiter', recruiterSchema);
const JobPost = mongoose.models.JobPost || mongoose.model('JobPost', jobPostSchema);
const InternshipPost = mongoose.models.InternshipPost || mongoose.model('InternshipPost', internshipPostSchema);

// Email mapping for fixing mismatches
const emailMapping = {
    // Map incorrect emails to correct recruiter emails
    'sarah.johnson@techglobal.com': 'sarah.johnson@financebank.com',
    'rahul.sharma@dataanalyticspro.com': 'john.smith@techcorp.com',
    'priya.mehta@fintechinnovations.com': 'michael.chen@healthcare.com',
    'rajesh.kumar@automech.com': 'john.smith@techcorp.com',
    'anita.singh@ecogreen.com': 'sarah.johnson@financebank.com',
    'suresh.reddy@powergrid.com': 'michael.chen@healthcare.com',
    'priya.sharma@techinnovate.com': 'john.smith@techcorp.com',
    'arjun.patel@techstartuplabs.com': 'sarah.johnson@financebank.com',
    'emily.watson@datainsights.com': 'michael.chen@healthcare.com',
    'kavya.nair@greentechsolutions.com': 'john.smith@techcorp.com',
    'vikram.singh@roboinnovations.com': 'sarah.johnson@financebank.com',
    'sneha.gupta@edutechlearning.com': 'michael.chen@healthcare.com',
};

const fixEmailMismatches = async () => {
    try {
        await connectToDb();
        
        console.log('🔧 Starting email synchronization...');
        
        // Get all recruiters
        const recruiters = await Recruiter.find({});
        console.log(`Found ${recruiters.length} recruiters`);
        
        // Get all job posts and internship posts
        const jobPosts = await JobPost.find({});
        const internshipPosts = await InternshipPost.find({});
        
        console.log(`Found ${jobPosts.length} job posts`);
        console.log(`Found ${internshipPosts.length} internship posts`);
        
        let jobPostsUpdated = 0;
        let internshipPostsUpdated = 0;
        
        // Update job posts
        for (const post of jobPosts) {
            const currentEmail = post.emailAddress;
            const correctEmail = emailMapping[currentEmail];
            
            if (correctEmail) {
                console.log(`Updating job post email from ${currentEmail} to ${correctEmail}`);
                await JobPost.findByIdAndUpdate(post._id, { emailAddress: correctEmail });
                jobPostsUpdated++;
            }
        }
        
        // Update internship posts
        for (const post of internshipPosts) {
            const currentEmail = post.emailAddress;
            const correctEmail = emailMapping[currentEmail];
            
            if (correctEmail) {
                console.log(`Updating internship post email from ${currentEmail} to ${correctEmail}`);
                await InternshipPost.findByIdAndUpdate(post._id, { emailAddress: correctEmail });
                internshipPostsUpdated++;
            }
        }
        
        console.log(`✅ Email synchronization completed!`);
        console.log(`📊 Updated ${jobPostsUpdated} job posts`);
        console.log(`📊 Updated ${internshipPostsUpdated} internship posts`);
        
        // Verify the fix
        console.log('\n🔍 Verifying the fix...');
        const updatedJobPosts = await JobPost.find({});
        const updatedInternshipPosts = await InternshipPost.find({});
        
        const uniqueJobEmails = [...new Set(updatedJobPosts.map(p => p.emailAddress))];
        const uniqueInternshipEmails = [...new Set(updatedInternshipPosts.map(p => p.emailAddress))];
        const recruiterEmails = recruiters.map(r => r.email);
        
        console.log('Recruiter emails:', recruiterEmails);
        console.log('Job post emails:', uniqueJobEmails);
        console.log('Internship post emails:', uniqueInternshipEmails);
        
        // Check if all emails now match
        const unmatchedJobEmails = uniqueJobEmails.filter(email => !recruiterEmails.includes(email));
        const unmatchedInternshipEmails = uniqueInternshipEmails.filter(email => !recruiterEmails.includes(email));
        
        if (unmatchedJobEmails.length === 0 && unmatchedInternshipEmails.length === 0) {
            console.log('✅ All emails are now synchronized!');
        } else {
            console.log('⚠️  Some emails still don\'t match:');
            if (unmatchedJobEmails.length > 0) {
                console.log('Unmatched job emails:', unmatchedJobEmails);
            }
            if (unmatchedInternshipEmails.length > 0) {
                console.log('Unmatched internship emails:', unmatchedInternshipEmails);
            }
        }
        
    } catch (error) {
        console.error('❌ Error during email synchronization:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

// Run the script
fixEmailMismatches();
