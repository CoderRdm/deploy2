// src/app/api/student/announcements/internships/[id]/route.js
import connectToDb from "@/lib/db";
import { InternshipPost } from "@/lib/models/InternshipPost";
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
        const { id } = await params; // This is the internship post ID

        const internshipPost = await InternshipPost.findById(id);

        if (!internshipPost || !internshipPost.isAnnounced) { // Only show announced internships
            return NextResponse.json({ success: false, message: 'Internship post not found or not announced.' }, { status: 404 });
        }

        // --- NEW LOGIC: Check if the current student has applied ---
        const studentId = session.user.id;
        const hasApplied = internshipPost.applications.some(app => app.student.toString() === studentId);
        // --- END NEW LOGIC ---

        // Return the internship post data along with the hasApplied status
        return NextResponse.json({ success: true, data: { ...internshipPost.toObject(), hasApplied } });

    } catch (error) {
        console.error('Error fetching announced internship post details:', error);
        if (error.name === 'CastError') {
            return NextResponse.json({ success: false, message: 'Invalid Internship Post ID format.' }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}