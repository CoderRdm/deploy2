// src/app/api/admin/students/[id]/placement-availability/route.js
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
        console.warn(`Unauthorized access attempt to admin placement availability API from user: ${session?.user?.email || 'unauthenticated'}`);
        return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    try {
        // Await params in Next.js 15
        const resolvedParams = await params;
        const studentId = resolvedParams.id;
        const body = await request.json();
        const { availableForPlacement } = body;

        // Validate input
        if (typeof availableForPlacement !== 'boolean') {
            return NextResponse.json({ 
                success: false, 
                message: 'Invalid input. availableForPlacement must be a boolean.' 
            }, { status: 400 });
        }

        // Find and update the student
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { 
                availableForPlacement,
                placementAvailabilityUpdatedAt: new Date()
            },
            { new: true }
        ).select('student_id name email availableForPlacement placementAvailabilityUpdatedAt');

        if (!updatedStudent) {
            return NextResponse.json({ 
                success: false, 
                message: 'Student not found.' 
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully ${availableForPlacement ? 'marked student as available' : 'removed student from availability'} for placement season.`,
            data: updatedStudent
        });

    } catch (error) {
        console.error('Error updating student placement availability:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Internal Server Error' 
        }, { status: 500 });
    }
}
