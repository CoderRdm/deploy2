// src/app/api/student/announcements/jobs/[id]/route.js
import connectToDb from "@/lib/db";
import { JobPost } from "@/lib/models/JobPost";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    await connectToDb();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'student') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Student login required.' }, { status: 401 });
    }

    try {
        const { id } = await params; // This is the job post ID

        const jobPost = await JobPost.findById(id);

        if (!jobPost || !jobPost.isAnnounced) { // Only show announced jobs
            return NextResponse.json({ success: false, message: 'Job post not found or not announced.' }, { status: 404 });
        }

        // --- NEW LOGIC: Check if the current student has applied ---
        const studentId = session.user.id;
        const hasApplied = jobPost.applications.some(app => app.student.toString() === studentId);
        // --- END NEW LOGIC ---

        // Return the job post data along with the hasApplied status
        return NextResponse.json({ success: true, data: { ...jobPost.toObject(), hasApplied } });

    } catch (error) {
        console.error('Error fetching announced job post details:', error);
        if (error.name === 'CastError') {
            return NextResponse.json({ success: false, message: 'Invalid Job Post ID format.' }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}