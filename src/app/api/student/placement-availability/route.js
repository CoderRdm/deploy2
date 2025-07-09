// src/app/api/student/placement-availability/route.js
import connectToDb from "@/lib/db";
import { Student } from "@/lib/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(request) {
    await connectToDb();

    // Authentication check for student
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'student') {
        console.warn(`Unauthorized access attempt to /api/student/placement-availability from user: ${session?.user?.email || 'unauthenticated'}`);
        return NextResponse.json({ success: false, message: 'Unauthorized: Student access required.' }, { status: 401 });
    }

    try {
        const student = await Student.findOne({ student_id: session.user.studentId });

        if (!student) {
            return NextResponse.json({ success: false, message: 'Student not found.' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                availableForPlacement: student.availableForPlacement,
                placementAvailabilityUpdatedAt: student.placementAvailabilityUpdatedAt
            }
        });
    } catch (error) {
        console.error('Error fetching placement availability:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request) {
    await connectToDb();

    // Authentication check for student
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'student') {
        console.warn(`Unauthorized access attempt to /api/student/placement-availability from user: ${session?.user?.email || 'unauthenticated'}`);
        return NextResponse.json({ success: false, message: 'Unauthorized: Student access required.' }, { status: 401 });
    }

    try {
        const { availableForPlacement } = await request.json();

        if (typeof availableForPlacement !== 'boolean') {
            return NextResponse.json({ 
                success: false, 
                message: 'Invalid input. availableForPlacement must be a boolean.' 
            }, { status: 400 });
        }

        const student = await Student.findOne({ student_id: session.user.studentId });

        if (!student) {
            return NextResponse.json({ success: false, message: 'Student not found.' }, { status: 404 });
        }

        // Check if profile is completed
        if (!student.profile_completed) {
            return NextResponse.json({ 
                success: false, 
                message: 'Please complete your profile before marking yourself available for placement.' 
            }, { status: 400 });
        }

        // Update placement availability
        student.availableForPlacement = availableForPlacement;
        student.placementAvailabilityUpdatedAt = new Date();

        await student.save();

        return NextResponse.json({
            success: true,
            message: `Successfully ${availableForPlacement ? 'marked yourself as available' : 'removed yourself from availability'} for placement season.`,
            data: {
                availableForPlacement: student.availableForPlacement,
                placementAvailabilityUpdatedAt: student.placementAvailabilityUpdatedAt
            }
        });
    } catch (error) {
        console.error('Error updating placement availability:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
