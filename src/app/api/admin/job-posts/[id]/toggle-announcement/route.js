// src/app/api/admin/job-posts/[id]/toggle-announcement/route.js
import connectToDb from "@/lib/db";
import { JobPost } from "@/lib/models/JobPost";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
    await connectToDb();

    // Authentication check for admin
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    try {
        const { id } = params;
        
        // Find the job post
        const jobPost = await JobPost.findById(id);
        
        if (!jobPost) {
            return NextResponse.json({ success: false, message: 'Job post not found' }, { status: 404 });
        }

        // Toggle the announcement status
        jobPost.isAnnounced = !jobPost.isAnnounced;
        await jobPost.save();

        return NextResponse.json({ 
            success: true, 
            message: `Job post ${jobPost.isAnnounced ? 'announced' : 'unannounced'} successfully`,
            data: jobPost
        });

    } catch (error) {
        console.error('Error toggling job post announcement:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
