// src/app/api/student/apply/internship/route.js
import connectToDb from "@/lib/db";
import { InternshipPost } from "@/lib/models/InternshipPost";
import { Student } from "@/lib/models/Student"; // Make sure to import Student model
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// Eligibility checking functions (adapted for internships)
function checkStudentEligibility(internshipPost, studentProfile) {
    const results = [];

    // Check CGPA Requirements
    if (internshipPost.cgpaRequirements && studentProfile.cgpa?.overall) {
        const cgpaResult = checkCGPARequirement(
            internshipPost.cgpaRequirements, 
            studentProfile.cgpa.overall
        );
        results.push(cgpaResult);
    }

    // Check Program/Branch Requirements
    const programResult = checkProgramRequirement(
        internshipPost.requiredPrograms,
        internshipPost.requiredBranches,
        studentProfile
    );
    results.push(programResult);

    // Check Academic Year
    const yearResult = checkYearRequirement(internshipPost, studentProfile.year);
    results.push(yearResult);

    // Check Placement Availability
    const availabilityResult = checkPlacementAvailability(studentProfile);
    results.push(availabilityResult);

    return results.filter(result => result !== null);
}

function checkCGPARequirement(requirement, studentCGPA) {
    const cgpaPattern = /(\d+\.?\d*)/g;
    const matches = requirement.match(cgpaPattern);
    
    if (!matches) {
        return {
            type: 'CGPA',
            status: 'warning',
            message: 'CGPA requirement format unclear'
        };
    }

    const requiredCGPA = parseFloat(matches[0]);
    const meetsRequirement = studentCGPA >= requiredCGPA;

    return {
        type: 'CGPA',
        status: meetsRequirement ? 'pass' : 'fail',
        message: meetsRequirement 
            ? `CGPA requirement met (${studentCGPA} >= ${requiredCGPA})`
            : `CGPA requirement not met (${studentCGPA} < ${requiredCGPA})`
    };
}

function checkProgramRequirement(requiredPrograms, requiredBranches, student) {
    // Check if all branches are applicable
    if (requiredBranches?.allBranchesApplicable) {
        return {
            type: 'Program/Branch',
            status: 'pass',
            message: 'All branches are eligible'
        };
    }

    if (!student?.branch || !requiredBranches) {
        return {
            type: 'Program/Branch',
            status: 'warning',
            message: 'Branch information incomplete'
        };
    }

    const studentBranch = student.branch.toLowerCase();
    const studentProgram = student.degree?.toLowerCase() || '';

    // Check against each program
    const programs = ['btech', 'barch', 'mtech', 'mplan', 'msc', 'mba', 'phd'];
    
    for (const program of programs) {
        const branches = requiredBranches[program] || [];
        if (branches.length > 0) {
            const isEligible = branches.some(branch => 
                studentBranch.includes(branch.toLowerCase()) || 
                branch.toLowerCase().includes(studentBranch)
            );
            
            if (isEligible && (studentProgram.includes(program) || program === 'btech')) {
                return { 
                    type: 'Program/Branch',
                    status: 'pass', 
                    message: `Branch eligibility confirmed under ${program.toUpperCase()}` 
                };
            }
        }
    }

    return { 
        type: 'Program/Branch',
        status: 'fail', 
        message: `Branch ${student.branch} is not in the eligible branches list` 
    };
}

function checkYearRequirement(internshipPost, studentYear) {
    if (!studentYear || !internshipPost?.studentPassingYearForInternship) {
        return {
            type: 'Academic Year',
            status: 'warning',
            message: 'Academic year information incomplete'
        };
    }

    const eligibleYears = internshipPost.studentPassingYearForInternship;

    if (eligibleYears.length === 0) {
        return {
            type: 'Academic Year',
            status: 'pass',
            message: 'No year restrictions specified'
        };
    }

    const yearMappings = {
        1: ['1st year', 'first year', 'year 1'],
        2: ['2nd year', 'second year', 'year 2'],
        3: ['3rd year', 'third year', 'year 3'],
        4: ['4th year', 'fourth year', 'year 4', 'final year'],
        5: ['5th year', 'fifth year', 'year 5']
    };

    const isEligible = eligibleYears.some(year => {
        const yearOptions = yearMappings[studentYear] || [];
        return yearOptions.some(option => 
            year.toLowerCase().includes(option) || 
            option.includes(year.toLowerCase())
        );
    });

    return {
        type: 'Academic Year',
        status: isEligible ? 'pass' : 'fail',
        message: isEligible 
            ? `Academic year eligibility confirmed`
            : `Year ${studentYear} students are not eligible. Required: ${eligibleYears.join(', ')}`
    };
}

function checkPlacementAvailability(student) {
    return {
        type: 'Placement Status',
        status: student.availableForPlacement ? 'pass' : 'fail',
        message: student.availableForPlacement 
            ? 'Available for placement'
            : 'Must be marked available for placement to apply'
    };
}

export async function POST(request) {
    await connectToDb();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'student') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Student login required.' }, { status: 401 });
    }

    const applicationData = await request.json();
    const { postId, coverLetter, additionalInfo, eligibilityAcknowledged } = applicationData;

    if (!postId) {
        return NextResponse.json({ success: false, message: 'Internship Post ID is required.' }, { status: 400 });
    }

    // Optional validation - no required fields except postId

    // Remove acknowledgment requirement

    try {
        const studentId = session.user.id;

        // 1. Find the Internship Post
        const internshipPost = await InternshipPost.findById(postId);
        if (!internshipPost) {
            return NextResponse.json({ success: false, message: 'Internship post not found.' }, { status: 404 });
        }

        // 2. Check if the student has already applied
        const hasApplied = internshipPost.applications.some(app => app.student.toString() === studentId);
        if (hasApplied) {
            return NextResponse.json({ success: false, message: 'You have already applied for this internship.' }, { status: 409 }); // 409 Conflict
        }

        // 3. Get student profile for eligibility verification
        const studentProfile = await Student.findById(studentId);
        if (!studentProfile) {
            return NextResponse.json({ success: false, message: 'Student profile not found.' }, { status: 404 });
        }

        // 4. Optional eligibility check - for informational purposes only
        // We perform eligibility checks but don't block applications
        // This allows students to apply regardless of eligibility status
        const eligibilityResults = checkStudentEligibility(internshipPost, studentProfile);
        const isEligible = eligibilityResults.every(result => result.status !== 'fail');
        
        // Note: Eligibility information is stored but applications are not blocked

        // 5. Get request metadata for audit trail
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // 6. Add the student's enhanced application to the internship post
        const applicationEntry = {
            student: studentId,
            appliedDate: new Date(),
            status: 'Applied',
            // Enhanced application data
            coverLetter: coverLetter.trim(),
            additionalInfo: additionalInfo?.trim() || '',
            eligibilityAcknowledged: true,
            // Audit trail
            submissionIp: ip,
            browserInfo: userAgent
        };

        internshipPost.applications.push(applicationEntry);
        await internshipPost.save();

        // Also update the student's application record
        try {
            const student = await Student.findById(studentId);
            if (student) {
                // Initialize companyApplications if it doesn't exist
                if (!student.companyApplications) {
                    student.companyApplications = { jobs: [], internships: [] };
                }

                // Create application record for student profile
                const studentApplicationRecord = {
                    postId: internshipPost._id,
                    companyName: internshipPost.organizationName,
                    position: internshipPost.internshipProfile,
                    appliedDate: new Date(),
                    currentStatus: 'Applied',
                    statusHistory: [{
                        status: 'Applied',
                        updatedDate: new Date(),
                        updatedBy: 'Student',
                        notes: 'Application submitted'
                    }],
                    coverLetter: coverLetter.trim(),
                    additionalInfo: additionalInfo ? additionalInfo.trim() : ''
                };

                // Check if application already exists
                const existingIndex = student.companyApplications.internships.findIndex(
                    app => app.postId.toString() === internshipPost._id.toString()
                );

                if (existingIndex === -1) {
                    student.companyApplications.internships.push(studentApplicationRecord);
                    await student.save();
                }
            }
        } catch (profileUpdateError) {
            console.error('Error updating student profile with application:', profileUpdateError);
            // Don't fail the main application if profile update fails
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Application submitted successfully! You will be notified of any updates regarding your application status.',
            data: {
                applicationId: applicationEntry._id,
                submittedAt: applicationEntry.appliedDate,
                internshipTitle: internshipPost.internshipProfile,
                companyName: internshipPost.organizationName
            }
        });

    } catch (error) {
        console.error('Error applying for internship:', error);
        if (error.name === 'CastError') {
            return NextResponse.json({ success: false, message: 'Invalid Internship Post ID format.' }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
