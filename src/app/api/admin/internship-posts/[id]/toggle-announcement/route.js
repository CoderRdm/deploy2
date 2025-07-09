// src/app/api/admin/internship-posts/[id]/toggle-announcement/route.js
import connectToDb from "@/lib/db";
import { InternshipPost } from "@/lib/models/InternshipPost";
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
        
        // Find the internship post
        const internshipPost = await InternshipPost.findById(id);
        
        if (!internshipPost) {
            return NextResponse.json({ success: false, message: 'Internship post not found' }, { status: 404 });
        }

        // Toggle the announcement status
        internshipPost.isAnnounced = !internshipPost.isAnnounced;
        await internshipPost.save();

        return NextResponse.json({ 
            success: true, 
            message: `Internship post ${internshipPost.isAnnounced ? 'announced' : 'unannounced'} successfully`,
            data: internshipPost
        });

    } catch (error) {
        console.error('Error toggling internship post announcement:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
