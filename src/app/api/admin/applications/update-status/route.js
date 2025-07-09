// src/app/api/admin/applications/update-status/route.js
import { JobPost } from "@/lib/models/JobPost";
import { InternshipPost } from "@/lib/models/InternshipPost";
import connectToDb from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function PATCH(request) {
    try {
        await connectToDb();
        
        // Check if user is admin
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: Admin access required.' },
                { status: 401 }
            );
        }

        const { postId, postType, applicationId, newStatus } = await request.json();

        // Validate input
        if (!postId || !postType || !applicationId || !newStatus) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: postId, postType, applicationId, newStatus' },
                { status: 400 }
            );
        }

        const validStatuses = ['Applied', 'Reviewed', 'Interview Scheduled', 'Selected', 'Rejected'];
        if (!validStatuses.includes(newStatus)) {
            return NextResponse.json(
                { success: false, message: 'Invalid status value' },
                { status: 400 }
            );
        }

        let Model;
        if (postType === 'job') {
            Model = JobPost;
        } else if (postType === 'internship') {
            Model = InternshipPost;
        } else {
            return NextResponse.json(
                { success: false, message: 'Invalid post type. Must be "job" or "internship".' },
                { status: 400 }
            );
        }

        // Update the application status
        const updatedPost = await Model.findOneAndUpdate(
            { 
                _id: postId,
                'applications._id': applicationId 
            },
            { 
                $set: { 'applications.$.status': newStatus }
            },
            { new: true }
        ).populate('applications.student', 'name email student_id');

        if (!updatedPost) {
            return NextResponse.json(
                { success: false, message: 'Post or application not found' },
                { status: 404 }
            );
        }

        // Find the updated application
        const updatedApplication = updatedPost.applications.find(
            app => app._id.toString() === applicationId
        );

        return NextResponse.json({
            success: true,
            message: `Application status updated to ${newStatus}`,
            data: {
                application: updatedApplication,
                post: updatedPost
            }
        });

    } catch (error) {
        console.error('Error updating application status:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
