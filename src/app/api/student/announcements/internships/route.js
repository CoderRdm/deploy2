// src/app/api/student/announcements/internships/route.js
import connectToDb from "@/lib/db";
import { InternshipPost } from "@/lib/models/InternshipPost";
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

        // Fetch all internship posts that are announced
        const announcedInternshipPosts = await InternshipPost.find({ isAnnounced: true }).sort({ createdAt: -1 });

        // Augment each internship post with hasApplied status for the current student
        const internshipsWithStatus = announcedInternshipPosts.map(internshipPost => {
            const hasApplied = internshipPost.applications.some(app => app.student.toString() === studentId);
            return { ...internshipPost.toObject(), hasApplied };
        });

        return NextResponse.json({ success: true, data: internshipsWithStatus });

    } catch (error) {
        console.error('Error fetching all announced internship posts:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}