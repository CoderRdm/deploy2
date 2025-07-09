// src/app/api/student/update-application-record/route.js
import connectToDb from "@/lib/db";
import { Student } from "@/lib/models/Student";
import { JobPost } from "@/lib/models/JobPost";
import { InternshipPost } from "@/lib/models/InternshipPost";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(request) {
    await connectToDb();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'student') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Student login required.' }, { status: 401 });
    }

    try {
        const { postId, postType, applicationData } = await request.json();
        
        if (!postId || !postType || !applicationData) {
            return NextResponse.json({ 
                success: false, 
                message: 'Missing required fields: postId, postType, and applicationData are required.' 
            }, { status: 400 });
        }

        if (!['job', 'internship'].includes(postType)) {
            return NextResponse.json({ 
                success: false, 
                message: 'Invalid postType. Must be either "job" or "internship".' 
            }, { status: 400 });
        }

        const studentId = session.user.id;
        const student = await Student.findById(studentId);
        
        if (!student) {
            return NextResponse.json({ success: false, message: 'Student not found.' }, { status: 404 });
        }

        // Get post details to extract company name and position
        let post;
        let companyName;
        let position;

        if (postType === 'job') {
            post = await JobPost.findById(postId);
            if (!post) {
                return NextResponse.json({ success: false, message: 'Job post not found.' }, { status: 404 });
            }
            companyName = post.organizationName;
            position = post.jobDesignation;
        } else {
            post = await InternshipPost.findById(postId);
            if (!post) {
                return NextResponse.json({ success: false, message: 'Internship post not found.' }, { status: 404 });
            }
            companyName = post.organizationName;
            position = post.internshipProfile;
        }

        // Create application record
        const applicationRecord = {
            postId: postId,
            companyName: companyName,
            position: position,
            appliedDate: new Date(),
            currentStatus: 'Applied',
            statusHistory: [{
                status: 'Applied',
                updatedDate: new Date(),
                updatedBy: 'Student',
                notes: 'Application submitted'
            }],
            coverLetter: applicationData.coverLetter || '',
            additionalInfo: applicationData.additionalInfo || ''
        };

        // Add specific fields based on post type
        if (postType === 'internship') {
            applicationRecord.duration = post.internshipDuration || '';
            applicationRecord.stipend = post.remuneration?.btech?.stipend || post.remuneration?.mtech?.stipend || 0;
        }

        // Initialize companyApplications if it doesn't exist
        if (!student.companyApplications) {
            student.companyApplications = { jobs: [], internships: [] };
        }

        // Check if application already exists
        const existingApplicationIndex = postType === 'job' 
            ? student.companyApplications.jobs.findIndex(app => app.postId.toString() === postId)
            : student.companyApplications.internships.findIndex(app => app.postId.toString() === postId);

        if (existingApplicationIndex !== -1) {
            return NextResponse.json({ 
                success: false, 
                message: 'Application record already exists for this position.' 
            }, { status: 409 });
        }

        // Add application to student record
        if (postType === 'job') {
            student.companyApplications.jobs.push(applicationRecord);
        } else {
            student.companyApplications.internships.push(applicationRecord);
        }

        await student.save();

        return NextResponse.json({ 
            success: true, 
            message: 'Application record updated successfully!',
            data: applicationRecord
        });

    } catch (error) {
        console.error('Error updating application record:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

// API to update application status
export async function PATCH(request) {
    await connectToDb();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: 'Unauthorized access.' }, { status: 401 });
    }

    try {
        const { studentId, postId, postType, newStatus, notes = '', updatedBy } = await request.json();
        
        if (!studentId || !postId || !postType || !newStatus) {
            return NextResponse.json({ 
                success: false, 
                message: 'Missing required fields.' 
            }, { status: 400 });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return NextResponse.json({ success: false, message: 'Student not found.' }, { status: 404 });
        }

        // Find and update the application
        let applicationIndex = -1;
        let applications = postType === 'job' 
            ? student.companyApplications?.jobs || []
            : student.companyApplications?.internships || [];

        applicationIndex = applications.findIndex(app => app.postId.toString() === postId);

        if (applicationIndex === -1) {
            return NextResponse.json({ 
                success: false, 
                message: 'Application record not found.' 
            }, { status: 404 });
        }

        // Update status and add to history
        applications[applicationIndex].currentStatus = newStatus;
        applications[applicationIndex].statusHistory.push({
            status: newStatus,
            updatedDate: new Date(),
            updatedBy: updatedBy || session.user.name || 'System',
            notes: notes
        });

        await student.save();

        return NextResponse.json({ 
            success: true, 
            message: 'Application status updated successfully!',
            data: applications[applicationIndex]
        });

    } catch (error) {
        console.error('Error updating application status:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
