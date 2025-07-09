// scripts/add-company-data.js
import connectToDb from '../src/lib/db.js';
import { Student } from '../src/lib/models/Student.js';
import { JobPost } from '../src/lib/models/JobPost.js';
import { InternshipPost } from '../src/lib/models/InternshipPost.js';
import mongoose from 'mongoose';

async function addTestCompanyData() {
    try {
        await connectToDb();
        console.log('Connected to database');

        // Find some existing students
        const students = await Student.find({}).limit(5);
        
        if (students.length === 0) {
            console.log('No students found. Please run the application first to create students.');
            return;
        }

        console.log(`Found ${students.length} students. Adding test company data...`);

        // Get some existing job and internship posts
        const jobPosts = await JobPost.find({}).limit(3);
        const internshipPosts = await InternshipPost.find({}).limit(2);

        // Sample company data for testing
        const sampleCompanies = [
            {
                name: 'TechCorp Solutions',
                jobPosition: 'Software Engineer',
                internshipPosition: 'Full Stack Developer Intern'
            },
            {
                name: 'InnovateLabs Pvt Ltd',
                jobPosition: 'Backend Developer',
                internshipPosition: 'Python Developer Intern'
            },
            {
                name: 'DataMine Analytics',
                jobPosition: 'Data Scientist',
                internshipPosition: 'Data Analyst Intern'
            },
            {
                name: 'CloudTech Systems',
                jobPosition: 'DevOps Engineer',
                internshipPosition: 'Cloud Infrastructure Intern'
            },
            {
                name: 'CyberSecure Inc',
                jobPosition: 'Security Analyst',
                internshipPosition: 'Cybersecurity Intern'
            }
        ];

        // Add test data to each student
        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            console.log(`Processing student: ${student.name} (${student.student_id})`);

            // Initialize companyApplications if it doesn't exist
            if (!student.companyApplications) {
                student.companyApplications = { jobs: [], internships: [] };
            }

            if (!student.placements) {
                student.placements = { finalJob: null, internshipsCompleted: [] };
            }

            // Add job applications
            const numJobApps = Math.floor(Math.random() * 4) + 1; // 1-4 applications
            for (let j = 0; j < numJobApps; j++) {
                const company = sampleCompanies[j % sampleCompanies.length];
                const statuses = ['Applied', 'Reviewed', 'Interview Scheduled', 'Selected', 'Rejected'];
                const currentStatus = statuses[Math.floor(Math.random() * statuses.length)];
                
                const appliedDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Random date in last 90 days

                const jobApplication = {
                    postId: jobPosts[j % jobPosts.length]?._id || new mongoose.Types.ObjectId(),
                    companyName: company.name,
                    position: company.jobPosition,
                    appliedDate: appliedDate,
                    currentStatus: currentStatus,
                    statusHistory: [
                        {
                            status: 'Applied',
                            updatedDate: appliedDate,
                            updatedBy: 'Student',
                            notes: 'Application submitted'
                        }
                    ],
                    coverLetter: `I am very excited about the ${company.jobPosition} position at ${company.name}. With my academic background and passion for technology, I believe I can contribute effectively to your team.`,
                    additionalInfo: 'I have worked on several projects and am eager to apply my skills in a professional environment.'
                };

                // Add status history if not just applied
                if (currentStatus !== 'Applied') {
                    jobApplication.statusHistory.push({
                        status: currentStatus,
                        updatedDate: new Date(appliedDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000),
                        updatedBy: 'HR Team',
                        notes: `Status updated to ${currentStatus}`
                    });
                }

                // Add offer details if selected
                if (currentStatus === 'Selected') {
                    jobApplication.offerDetails = {
                        offered: true,
                        ctc: Math.floor(Math.random() * 1000000) + 500000, // 5-15 LPA
                        joiningDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000), // Future date
                        offerLetterReceived: true,
                        accepted: Math.random() > 0.3 // 70% chance of acceptance
                    };
                }

                student.companyApplications.jobs.push(jobApplication);
            }

            // Add internship applications
            const numInternshipApps = Math.floor(Math.random() * 3) + 1; // 1-3 applications
            for (let j = 0; j < numInternshipApps; j++) {
                const company = sampleCompanies[j % sampleCompanies.length];
                const statuses = ['Applied', 'Reviewed', 'Interview Scheduled', 'Selected', 'Rejected'];
                const currentStatus = statuses[Math.floor(Math.random() * statuses.length)];
                
                const appliedDate = new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000); // Random date in last 120 days

                const internshipApplication = {
                    postId: internshipPosts[j % internshipPosts.length]?._id || new mongoose.Types.ObjectId(),
                    companyName: company.name,
                    position: company.internshipPosition,
                    appliedDate: appliedDate,
                    currentStatus: currentStatus,
                    statusHistory: [
                        {
                            status: 'Applied',
                            updatedDate: appliedDate,
                            updatedBy: 'Student',
                            notes: 'Application submitted'
                        }
                    ],
                    coverLetter: `I am eager to apply for the ${company.internshipPosition} position at ${company.name}. This internship aligns perfectly with my career goals and academic background.`,
                    additionalInfo: 'I am looking forward to gaining hands-on experience and contributing to meaningful projects.',
                    duration: '8-12 weeks',
                    stipend: Math.floor(Math.random() * 30000) + 15000 // 15k-45k stipend
                };

                // Add status history if not just applied
                if (currentStatus !== 'Applied') {
                    internshipApplication.statusHistory.push({
                        status: currentStatus,
                        updatedDate: new Date(appliedDate.getTime() + Math.random() * 20 * 24 * 60 * 60 * 1000),
                        updatedBy: 'HR Team',
                        notes: `Status updated to ${currentStatus}`
                    });
                }

                student.companyApplications.internships.push(internshipApplication);
            }

            // Add final placement for some students (30% chance)
            if (Math.random() > 0.7) {
                const company = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];
                student.placements.finalJob = {
                    companyName: company.name,
                    position: company.jobPosition,
                    ctc: Math.floor(Math.random() * 1200000) + 600000, // 6-18 LPA
                    joiningDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000),
                    workLocation: ['Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Chennai'][Math.floor(Math.random() * 5)],
                    offerType: ['Regular', 'PPO'][Math.floor(Math.random() * 2)],
                    placedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    isCurrentJob: true
                };
            }

            // Add completed internships for some students (50% chance)
            if (Math.random() > 0.5) {
                const numCompletedInternships = Math.floor(Math.random() * 2) + 1; // 1-2 completed internships
                for (let j = 0; j < numCompletedInternships; j++) {
                    const company = sampleCompanies[j % sampleCompanies.length];
                    
                    const startDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
                    const endDate = new Date(startDate.getTime() + (Math.random() * 90 + 30) * 24 * 60 * 60 * 1000); // 30-120 days duration

                    const completedInternship = {
                        companyName: company.name,
                        position: company.internshipPosition,
                        duration: `${Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000))} days`,
                        startDate: startDate,
                        endDate: endDate,
                        stipend: Math.floor(Math.random() * 40000) + 20000,
                        completionStatus: 'Completed',
                        ppoReceived: Math.random() > 0.7, // 30% chance of PPO
                        ppoCtc: Math.random() > 0.7 ? Math.floor(Math.random() * 800000) + 400000 : null,
                        ppoAccepted: false,
                        certificateReceived: true,
                        performanceRating: ['Excellent', 'Good', 'Average'][Math.floor(Math.random() * 3)],
                        feedback: 'Great learning experience with excellent mentorship and challenging projects.'
                    };

                    student.placements.internshipsCompleted.push(completedInternship);
                }
            }

            // Save the updated student
            await student.save();
            console.log(`✅ Updated ${student.name} with company data`);
        }

        console.log('\n🎉 Successfully added test company data to all students!');
        console.log('\nTo view the results:');
        console.log('1. Start the development server: npm run dev');
        console.log('2. Login as a student');
        console.log('3. Go to the Dashboard');
        console.log('4. Scroll down to see the "Your Companies" section');
        console.log('5. Explore both "Applications" and "Placements" tabs');

    } catch (error) {
        console.error('Error adding test company data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

addTestCompanyData();
