// src/app/api/spc/students/route.js
import { getServerSession } from "next-auth";
import { Student } from "@/lib/models/Student"; // Assuming Student model path
import connectToDb from "@/lib/db";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
    await connectToDb();
    const session = await getServerSession(authOptions);

    // Authorize: Must be a student AND an SPC
    if (!session || !session.user || session.user.role !== 'student' || !session.user.isSPC) {
        // Log for debugging
        console.warn('Unauthorized access attempt to /api/spc/students from user:', session?.user?.email || 'N/A');
        return NextResponse.json({ success: false, message: 'Unauthorized: SPC privileges required.' }, { status: 403 });
    }

    try {
        // Fetch all students. Consider limiting fields if not all are needed for the list view
        const students = await Student.find({}); // Fetch all students
        return NextResponse.json({ success: true, data: students });
    } catch (error) {
        console.error('Error fetching SPC students:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}