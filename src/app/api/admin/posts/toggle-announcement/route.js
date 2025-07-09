// src/app/api/admin/posts/toggle-announcement/route.js
import connectToDb from "@/lib/db";
import { JobPost } from "@/lib/models/JobPost";
import { InternshipPost } from "@/lib/models/InternshipPost";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function PATCH(request) { // Using PATCH for partial updates
    await connectToDb();

    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'admin') {
        console.warn(`Unauthorized access attempt to toggle announcement from user: ${session?.user?.email || 'unauthenticated'}`);
        return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    try {
        const { postId, postType, isAnnounced } = await request.json();

        if (!postId || !postType || typeof isAnnounced !== 'boolean') {
            return NextResponse.json({ success: false, message: 'Missing postId, postType, or isAnnounced status.' }, { status: 400 });
        }

        let Model;
        if (postType === 'job') {
            Model = JobPost;
        } else if (postType === 'internship') {
            Model = InternshipPost;
        } else {
            return NextResponse.json({ success: false, message: 'Invalid postType. Must be "job" or "internship".' }, { status: 400 });
        }

        const updatedPost = await Model.findByIdAndUpdate(
            postId,
            { isAnnounced: isAnnounced },
            { new: true } // Return the updated document
        );

        if (!updatedPost) {
            return NextResponse.json({ success: false, message: `${postType} post not found.` }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: `${postType} post announcement status updated.`, data: updatedPost });
    } catch (error) {
        console.error(`Error toggling ${postType} announcement status:`, error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}