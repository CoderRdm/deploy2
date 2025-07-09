// src/app/api/admin/students/[id]/cleanup-redflags/route.js
import { getServerSession } from "next-auth";
import { Student } from "@/lib/models/Student";
import connectToDb from "@/lib/db";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request, { params }) {
    await connectToDb();

    const session = await getServerSession(authOptions);

    // Admin authentication check
    if (!session || !session.user || session.user.role !== 'admin') {
        console.warn(`Unauthorized access attempt to cleanup redflags API from user: ${session?.user?.email || 'unauthenticated'}`);
        return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    try {
        // Await params in Next.js 15
        const resolvedParams = await params;
        const studentId = resolvedParams.id;

        // Find the student
        const student = await Student.findById(studentId);

        if (!student) {
            return NextResponse.json({ 
                success: false, 
                message: 'Student not found.' 
            }, { status: 404 });
        }

        // Filter out legacy red flags (those without proper structure)
        const cleanRedFlags = student.redflags.filter(flag => {
            // Check if flag is a proper object with required fields
            return flag && 
                   typeof flag === 'object' && 
                   flag._id && 
                   flag.reason && 
                   flag.assignedBy && 
                   flag.assignedById && 
                   flag.createdAt;
        });

        const removedCount = student.redflags.length - cleanRedFlags.length;

        // Update the student with cleaned red flags
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { redflags: cleanRedFlags },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            message: `Successfully cleaned up ${removedCount} legacy red flag(s). ${cleanRedFlags.length} valid red flag(s) remain.`,
            data: updatedStudent
        });

    } catch (error) {
        console.error('Error cleaning up legacy red flags:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Internal Server Error' 
        }, { status: 500 });
    }
}
