// src/app/api/admin/students/route.js
import connectToDb from "@/lib/db";
import { Student } from "@/lib/models/Student"; // Import your Student model
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Make sure authOptions is exported
import { NextResponse } from "next/server";

export async function GET(request) {
    await connectToDb();

    // Authentication check for admin
    const session = await getServerSession(authOptions);

    // Ensure the user is authenticated and has the 'admin' role
    if (!session || !session.user || session.user.role !== 'admin') {
        console.warn(`Unauthorized access attempt to /api/admin/students from user: ${session?.user?.email || 'unauthenticated'}`);
        return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    try {
        // Fetch all student documents, sorted by creation date (most recent first)
        // You can select specific fields to return if you don't need all of them
        const students = await Student.find({}).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: students });
    } catch (error) {
        console.error('Error fetching student data for admin:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

