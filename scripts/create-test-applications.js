// scripts/create-test-applications.js
import mongoose from 'mongoose';
import { Student } from '../src/lib/models/Student.js';
import { JobPost } from '../src/lib/models/JobPost.js';
import { InternshipPost } from '../src/lib/models/InternshipPost.js';
import connectToDb from '../src/lib/db.js';

async function createTestApplications() {
    try {
        await connectToDb();
        console.log('Connected to database');

        // First, let's create a test job post
        const testJobPost = new JobPost({
            organizationName: 'TechCorp Solutions',
            website: 'https://techcorp.com',
            organizationType: 'MNC (Foreign)',
            industrySector: 'IT',
            jobDesignation: 'Software Engineer',
            jobDescription: 'We are looking for talented software engineers to join our dynamic team. You will work on cutting-edge technologies and contribute to innovative solutions.',
            tentativeDateOfJoining: new Date('2024-07-15'),
            placeOfPosting: 'Bangalore, India',
            requiredPrograms: ['B.Tech', 'M.Tech'],
            requiredBranches: {
                btech: ['Computer Science Engineering', 'Electronics & Communication Engineering'],
                mtech: ['Computer Science Engineering'],
                allBranchesApplicable: false
            },
            numberOfPositions: 5,
            cgpaRequirements: 'Minimum 7.5 CGPA',
            remuneration: {
                btech: {
                    profile: 'Software Engineer',
                    basic: 800000,
                    hra: 160000,
                    other: 40000,
                    gross: 1000000,
                    takeHome: 850000,
                    ctc: 1200000
                },
                mtech: {
                    profile: 'Senior Software Engineer',
                    basic: 1000000,
                    hra: 200000,
                    other: 50000,
                    gross: 1250000,
                    takeHome: 1050000,
                    ctc: 1500000
                }
            },
            companyAccommodationProvided: true,
            serviceAgreementRequired: true,
            serviceAgreementDuration: 24,
            selectionProcess: {
                aptitudeTest: true,
                technicalTest: true,
                groupDiscussion: false,
                personalInterview: true,
                numberOfRounds: 3,
                provisionForWaitlist: true
            },
            contactPerson: 'Rahul Sharma',
            emailAddress: 'rahul.sharma@techcorp.com',
            contactAddress: 'TechCorp Solutions, Electronic City, Bangalore - 560100',
            mobileNo: '+91-9876543210',
            isAnnounced: true,
            applications: []
        });

        // Create a test internship post
        const testInternshipPost = new InternshipPost({
            organizationName: 'InnovateLabs Pvt Ltd',
            website: 'https://innovatelabs.in',
            organizationType: 'Start-up',
            industrySector: 'IT',
            internshipProfile: 'Full Stack Development Intern',
            tentativeDateOfJoining: new Date('2024-05-20'),
            internshipDuration: '8 weeks',
            placeOfPosting: 'Hyderabad, India',
            requiredPrograms: ['B.Tech'],
            requiredBranches: {
                btech: ['Computer Science Engineering', 'Information Technology'],
                allBranchesApplicable: false
            },
            numberOfPositions: 3,
            cgpaRequirements: 'Minimum 7.0 CGPA',
            studentPassingYearForInternship: ['2nd year', '3rd year'],
            remuneration: {
                btech: {
                    other: 'Food and accommodation provided',
                    stipend: 25000,
                    ctcPPO: 800000
                }
            },
            selectionProcess: {
                aptitudeTest: false,
                technicalTest: true,
                groupDiscussion: true,
                personalInterview: true,
                provisionForWaitlist: false
            },
            contactPerson: 'Priya Reddy',
            emailAddress: 'priya.reddy@innovatelabs.in',
            contactAddress: 'InnovateLabs, HITEC City, Hyderabad - 500081',
            mobileNo: '+91-9876543211',
            isAnnounced: true,
            applications: []
        });

        // Find some existing students to create applications
        const students = await Student.find({}).limit(5);
        
        if (students.length === 0) {
            console.log('No students found. Creating test students first...');
            
            // Create test students
            const testStudents = [
                {
                    student_id: 'TEST001',
                    name: 'Arjun Kumar',
                    email: 'arjun.kumar@mnit.ac.in',
                    year: '3rd Year',
                    branch: 'Computer Science Engineering',
                    gender: 'Male',
                    tenth_score: 85.5,
                    twelfth_score: 88.2,
                    current_cgpa: 8.2,
                    profile_completed: true,
                    placement_availability: 'Available'
                },
                {
                    student_id: 'TEST002',
                    name: 'Sneha Sharma',
                    email: 'sneha.sharma@mnit.ac.in',
                    year: '3rd Year',
                    branch: 'Electronics & Communication Engineering',
                    gender: 'Female',
                    tenth_score: 90.0,
                    twelfth_score: 92.5,
                    current_cgpa: 8.7,
                    profile_completed: true,
                    placement_availability: 'Available'
                },
                {
                    student_id: 'TEST003',
                    name: 'Rahul Verma',
                    email: 'rahul.verma@mnit.ac.in',
                    year: '4th Year',
                    branch: 'Computer Science Engineering',
                    gender: 'Male',
                    tenth_score: 87.3,
                    twelfth_score: 85.8,
                    current_cgpa: 7.9,
                    profile_completed: true,
                    placement_availability: 'Available'
                },
                {
                    student_id: 'TEST004',
                    name: 'Ananya Gupta',
                    email: 'ananya.gupta@mnit.ac.in',
                    year: '2nd Year',
                    branch: 'Information Technology',
                    gender: 'Female',
                    tenth_score: 92.1,
                    twelfth_score: 89.7,
                    current_cgpa: 8.5,
                    profile_completed: true,
                    placement_availability: 'Available'
                },
                {
                    student_id: 'TEST005',
                    name: 'Vikram Singh',
                    email: 'vikram.singh@mnit.ac.in',
                    year: '3rd Year',
                    branch: 'Computer Science Engineering',
                    gender: 'Male',
                    tenth_score: 83.4,
                    twelfth_score: 86.1,
                    current_cgpa: 7.6,
                    profile_completed: true,
                    placement_availability: 'Available'
                }
            ];

            await Student.insertMany(testStudents);
            console.log('Created 5 test students');
            
            // Fetch the newly created students
            const newStudents = await Student.find({ student_id: { $in: ['TEST001', 'TEST002', 'TEST003', 'TEST004', 'TEST005'] } });
            
            // Create job applications
            const jobApplications = [
                {
                    student: newStudents[0]._id, // Arjun Kumar
                    appliedDate: new Date('2024-01-15'),
                    status: 'Applied',
                    coverLetter: 'I am very excited about the Software Engineer position at TechCorp Solutions. With my strong background in computer science and experience in full-stack development, I believe I can contribute effectively to your team. I have worked on several projects using React, Node.js, and databases, which align well with your requirements.',
                    additionalInfo: 'I have completed internships at two startups and built several web applications. I am particularly interested in working with cutting-edge technologies and contributing to innovative solutions.',
                    eligibilityAcknowledged: true,
                    submissionIp: '192.168.1.100',
                    browserInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                {
                    student: newStudents[1]._id, // Sneha Sharma
                    appliedDate: new Date('2024-01-16'),
                    status: 'Reviewed',
                    coverLetter: 'I am writing to express my interest in the Software Engineer role at TechCorp Solutions. My academic background in Electronics & Communication Engineering, combined with my passion for software development, makes me a strong candidate. I have experience in embedded systems programming and web development.',
                    additionalInfo: 'I have won several coding competitions and have contributed to open-source projects. I am eager to transition into software engineering and apply my analytical skills.',
                    eligibilityAcknowledged: true,
                    submissionIp: '192.168.1.101',
                    browserInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                {
                    student: newStudents[2]._id, // Rahul Verma
                    appliedDate: new Date('2024-01-17'),
                    status: 'Interview Scheduled',
                    coverLetter: 'I am thrilled to apply for the Software Engineer position at TechCorp Solutions. With my solid foundation in computer science and hands-on experience in software development, I am confident in my ability to excel in this role. I have worked extensively with Java, Python, and JavaScript.',
                    additionalInfo: 'I have completed a summer internship at a tech company where I developed a complete web application. I am passionate about problem-solving and continuous learning.',
                    eligibilityAcknowledged: true,
                    submissionIp: '192.168.1.102',
                    browserInfo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            ];

            testJobPost.applications = jobApplications;

            // Create internship applications
            const internshipApplications = [
                {
                    student: newStudents[3]._id, // Ananya Gupta
                    appliedDate: new Date('2024-01-18'),
                    status: 'Applied',
                    coverLetter: 'I am excited to apply for the Full Stack Development Intern position at InnovateLabs. As a second-year IT student with a strong passion for web development, I am eager to gain hands-on experience in a startup environment. I have built several personal projects using React and Node.js.',
                    additionalInfo: 'I have completed online courses in full-stack development and have a GitHub portfolio showcasing my projects. I am particularly interested in working with modern web technologies.',
                    eligibilityAcknowledged: true,
                    submissionIp: '192.168.1.103',
                    browserInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                {
                    student: newStudents[4]._id, // Vikram Singh
                    appliedDate: new Date('2024-01-19'),
                    status: 'Selected',
                    coverLetter: 'I am writing to express my strong interest in the Full Stack Development Intern position at InnovateLabs. With my background in computer science and practical experience in web development, I am excited about the opportunity to contribute to innovative projects in a startup environment.',
                    additionalInfo: 'I have experience with both frontend and backend technologies, including React, Express.js, and MongoDB. I have also worked on mobile app development using React Native.',
                    eligibilityAcknowledged: true,
                    submissionIp: '192.168.1.104',
                    browserInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            ];

            testInternshipPost.applications = internshipApplications;

        } else {
            console.log(`Found ${students.length} existing students. Creating applications...`);
            
            // Create applications using existing students
            const jobApplications = students.slice(0, 3).map((student, index) => ({
                student: student._id,
                appliedDate: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)), // Stagger application dates
                status: ['Applied', 'Reviewed', 'Interview Scheduled'][index] || 'Applied',
                coverLetter: `I am very interested in the Software Engineer position at TechCorp Solutions. With my academic background and practical experience, I believe I can contribute effectively to your team. I have experience in various programming languages and am passionate about technology.`,
                additionalInfo: `Additional skills and projects that make me a suitable candidate for this role.`,
                eligibilityAcknowledged: true,
                submissionIp: `192.168.1.${100 + index}`,
                browserInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }));

            const internshipApplications = students.slice(0, 2).map((student, index) => ({
                student: student._id,
                appliedDate: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)),
                status: ['Applied', 'Selected'][index] || 'Applied',
                coverLetter: `I am excited to apply for the Full Stack Development Intern position at InnovateLabs. As a student with passion for web development, I am eager to gain practical experience in a dynamic startup environment.`,
                additionalInfo: `Portfolio of projects and relevant coursework that demonstrates my capabilities.`,
                eligibilityAcknowledged: true,
                submissionIp: `192.168.1.${110 + index}`,
                browserInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }));

            testJobPost.applications = jobApplications;
            testInternshipPost.applications = internshipApplications;
        }

        // Save the posts with applications
        await testJobPost.save();
        console.log('✅ Created job post with applications:', testJobPost._id);

        await testInternshipPost.save();
        console.log('✅ Created internship post with applications:', testInternshipPost._id);

        console.log('\n🎉 Test applications created successfully!');
        console.log('\nTo test the applied students section:');
        console.log('1. Start the development server: npm run dev');
        console.log('2. Login as admin');
        console.log('3. Go to Admin Dashboard');
        console.log('4. Click on any job post or internship post');
        console.log('5. Scroll down to see the "Applied Students" section');
        console.log('6. Click "View Details" to see the application modal');

        console.log('\nJob Post ID:', testJobPost._id);
        console.log('Internship Post ID:', testInternshipPost._id);

    } catch (error) {
        console.error('Error creating test applications:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

createTestApplications();
