// src/app/api/student/apply/job/route.js
import connectToDb from "@/lib/db";
import { JobPost } from "@/lib/models/JobPost";
import { Student } from "@/lib/models/Student"; // Make sure to import Student model
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// Eligibility checking functions (same logic as frontend RequirementsChecker)
function checkStudentEligibility(jobPost, studentProfile) {
    const results = [];

    // Check CGPA Requirements
    if (jobPost.cgpaRequirements && studentProfile.cgpa?.overall) {
        const cgpaResult = checkCGPARequirement(
            jobPost.cgpaRequirements, 
            studentProfile.cgpa.overall
        );
        results.push(cgpaResult);
    }

    // Check Program/Branch Requirements
    const programResult = checkProgramRequirement(
        jobPost.requiredPrograms,
        jobPost.requiredBranches,
        studentProfile
    );
    results.push(programResult);

    // Check Academic Year
    const yearResult = checkYearRequirement(jobPost, studentProfile.year);
    results.push(yearResult);

    // Check Backlogs
    const backlogResult = checkBacklogRequirement(
        jobPost.anyOtherRequirement,
        studentProfile.cgpa?.active_backlogs || 0
    );
    results.push(backlogResult);

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
    if (!requiredPrograms || requiredPrograms.length === 0) {
        return {
            type: 'Program/Branch',
            status: 'pass',
            message: 'All programs/branches eligible'
        };
    }

    if (requiredBranches?.allBranchesApplicable) {
        return {
            type: 'Program/Branch',
            status: 'pass',
            message: 'All branches are eligible'
        };
    }

    const programLevel = determineProgramLevel(student.year);
    const studentBranch = student.branch;
    const eligibleBranches = requiredBranches?.[programLevel] || [];
    const isEligible = eligibleBranches.length === 0 || 
                      eligibleBranches.includes(studentBranch) ||
                      eligibleBranches.includes('All');

    return {
        type: 'Program/Branch',
        status: isEligible ? 'pass' : 'fail',
        message: isEligible 
            ? `Branch eligibility confirmed`
            : `Branch ${studentBranch} not in eligible list`
    };
}

function checkYearRequirement(jobPost, studentYear) {
    const eligibleYears = ['4th', '4', 'Alumni'];
    const isEligible = eligibleYears.includes(studentYear);

    return {
        type: 'Academic Year',
        status: isEligible ? 'pass' : 'fail',
        message: isEligible 
            ? `Academic year eligibility confirmed`
            : `Academic year ${studentYear} not eligible for this position`
    };
}

function checkBacklogRequirement(otherRequirements, activeBacklogs) {
    if (!otherRequirements) {
        return {
            type: 'Academic Standing',
            status: activeBacklogs === 0 ? 'pass' : 'warning',
            message: activeBacklogs === 0 ? 'No active backlogs' : `${activeBacklogs} active backlogs`
        };
    }

    const hasBacklogRestriction = otherRequirements.toLowerCase().includes('no backlog') ||
                                 otherRequirements.toLowerCase().includes('no pending') ||
                                 otherRequirements.toLowerCase().includes('clear academic');
    
    if (hasBacklogRestriction && activeBacklogs > 0) {
        return {
            type: 'Academic Standing',
            status: 'fail',
            message: `${activeBacklogs} active backlogs but company requires clear academic record`
        };
    }

    return {
        type: 'Academic Standing',
        status: 'pass',
        message: 'Academic standing requirement met'
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

function determineProgramLevel(year) {
    switch (year) {
        case '1st':
        case '1':
        case '2nd':
        case '2':
        case '3rd':
        case '3':
        case '4th':
        case '4':
            return 'btech';
        default:
            return 'btech';
    }
}

export async function POST(request) {
    await connectToDb();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'student') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Student login required.' }, { status: 401 });
    }

    const { 
        postId, 
        coverLetter, 
        additionalInfo, 
        eligibilityAcknowledged,
        applicationDate 
    } = await request.json();

    if (!postId) {
        return NextResponse.json({ success: false, message: 'Job Post ID is required.' }, { status: 400 });
    }

    // Optional validation - only check if fields are provided
    // No required fields except postId

    try {
        const studentId = session.user.id;

        // 1. Find the Job Post
        const jobPost = await JobPost.findById(postId);
        if (!jobPost) {
            return NextResponse.json({ success: false, message: 'Job post not found.' }, { status: 404 });
        }

        // 2. Check if the student has already applied
        const hasApplied = jobPost.applications.some(app => app.student.toString() === studentId);
        if (hasApplied) {
            return NextResponse.json({ success: false, message: 'You have already applied for this job.' }, { status: 409 }); // 409 Conflict
        }

        // 3. Get student profile for application record
        const studentProfile = await Student.findById(studentId);
        if (!studentProfile) {
            return NextResponse.json({ success: false, message: 'Student profile not found.' }, { status: 404 });
        }

        // Optional eligibility check - for informational purposes only
        // We perform eligibility checks but don't block applications
        // This allows students to apply regardless of eligibility status
        const eligibilityResults = checkStudentEligibility(jobPost, studentProfile);
        const isEligible = eligibilityResults.every(result => result.status !== 'fail');
        
        // Note: Eligibility information is stored but applications are not blocked

        // 4. Add the student's application to the job post with enhanced data
        const applicationData = {
            student: studentId,
            appliedDate: new Date(),
            status: 'Applied',
            coverLetter: coverLetter.trim(),
            additionalInfo: additionalInfo ? additionalInfo.trim() : '',
            eligibilityAcknowledged: eligibilityAcknowledged,
            // Get client IP and browser info for audit trail
            submissionIp: request.headers.get('x-forwarded-for') || 
                          request.headers.get('x-real-ip') || 
                          'unknown',
            browserInfo: request.headers.get('user-agent') || 'unknown'
        };

        jobPost.applications.push(applicationData);
        await jobPost.save();

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
                    postId: jobPost._id,
                    companyName: jobPost.organizationName,
                    position: jobPost.jobDesignation,
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

                // Check if application already exists (double-check)
                const existingIndex = student.companyApplications.jobs.findIndex(
                    app => app.postId.toString() === jobPost._id.toString()
                );

                if (existingIndex === -1) {
                    student.companyApplications.jobs.push(studentApplicationRecord);
                    await student.save();
                }
            }
        } catch (profileUpdateError) {
            console.error('Error updating student profile with application:', profileUpdateError);
            // Don't fail the main application if profile update fails
        }

        return NextResponse.json({ success: true, message: 'Application submitted successfully!', data: jobPost.applications });

    } catch (error) {
        console.error('Error applying for job:', error);
        if (error.name === 'CastError') {
            return NextResponse.json({ success: false, message: 'Invalid Job Post ID format.' }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}