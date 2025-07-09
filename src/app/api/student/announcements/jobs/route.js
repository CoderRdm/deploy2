// src/app/api/student/announcements/jobs/route.js
import connectToDb from "@/lib/db";
import { JobPost } from "@/lib/models/JobPost";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(request) {
    await connectToDb();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'student') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Student login required.' }, { status: 401 });
    }

    try {
        const studentId = session.user.id;

        // Fetch all job posts that are announced
        const announcedJobPosts = await JobPost.find({ isAnnounced: true }).sort({ createdAt: -1 });

        // Augment each job post with hasApplied status for the current student
        const jobsWithStatus = announcedJobPosts.map(jobPost => {
            const hasApplied = jobPost.applications.some(app => app.student.toString() === studentId);
            return { ...jobPost.toObject(), hasApplied };
        });

        return NextResponse.json({ success: true, data: jobsWithStatus });

    } catch (error) {
        console.error('Error fetching all announced job posts:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}