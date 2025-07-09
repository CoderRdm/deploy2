// src/app/api/spc/posts/toggle-announcement/route.js
import { getServerSession } from "next-auth";
import { JobPost } from "@/lib/models/JobPost";
import { InternshipPost } from "@/lib/models/InternshipPost";
import connectToDb from "@/lib/db";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request) {
    await connectToDb();
    const session = await getServerSession(authOptions);

    // Authorize: Must be a student AND an SPC
    if (!session || !session.user || session.user.role !== 'student' || !session.user.isSPC) {
        return NextResponse.json({ success: false, message: 'Unauthorized: SPC privileges required.' }, { status: 403 });
    }

    try {
        const { postId, postType, isAnnounced } = await request.json();

        if (!postId || !postType || typeof isAnnounced !== 'boolean') {
            return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
        }

        let updatedPost;
        if (postType === 'job') {
            updatedPost = await JobPost.findByIdAndUpdate(postId, { isAnnounced }, { new: true });
        } else if (postType === 'internship') {
            updatedPost = await InternshipPost.findByIdAndUpdate(postId, { isAnnounced }, { new: true });
        } else {
            return NextResponse.json({ success: false, message: 'Invalid postType.' }, { status: 400 });
        }

        if (!updatedPost) {
            return NextResponse.json({ success: false, message: `${postType} post not found.` }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: `${postType} post status updated to ${isAnnounced ? 'announced' : 'unannounced'}.`,
            data: updatedPost
        });

    } catch (error) {
        console.error('Error toggling post announcement status:', error);
        if (error.name === 'CastError') {
            return NextResponse.json({ success: false, message: 'Invalid Post ID format.' }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}