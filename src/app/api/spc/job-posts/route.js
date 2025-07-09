// src/app/api/spc/job-posts/route.js
import { getServerSession } from "next-auth";
import { JobPost } from "@/lib/models/JobPost"; // Assuming Job model path
import connectToDb from "@/lib/db";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
    await connectToDb();
    const session = await getServerSession(authOptions);

    // Authorize: Must be a student AND an SPC
    if (!session || !session.user || session.user.role !== 'student' || !session.user.isSPC) {
        return NextResponse.json({ success: false, message: 'Unauthorized: SPC privileges required.' }, { status: 403 });
    }

    try {
        // SPCs should be able to see all job posts, announced or not, for management
        const jobPosts = await JobPost.find({}); // Fetch all job posts
        return NextResponse.json({ success: true, data: jobPosts });
    } catch (error) {
        console.error('Error fetching SPC job posts:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}