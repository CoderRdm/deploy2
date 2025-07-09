// src/app/api/admin/internship-posts/[id]/route.js
import { InternshipPost } from "@/lib/models/InternshipPost";
import connectToDb from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    await connectToDb();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const { id } = await params; // Get the ID from the dynamic route

    try {
        const internshipPost = await InternshipPost.findById(id).populate('applications.student', 'name email student_id branch year cgpa resume');

        if (!internshipPost) {
            return NextResponse.json({ success: false, message: 'Internship post not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: internshipPost });
    } catch (error) {
        console.error('Error fetching internship post by ID:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}