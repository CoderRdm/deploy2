// src/app/api/student/profile/route.js
import { getServerSession } from "next-auth";
import { Student } from "@/lib/models/Student";
import connectToDb from "@/lib/db";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request) {
    await connectToDb();

    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.studentId) {
        return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    // This is your custom student_id (e.g., "STU_1749325651632")
    const customStudentId = session.user.studentId; 

    try {
        const body = await request.json();
        const { year, branch, gender, tenth_score, twelfth_score, father_name, current_semester, dob, cgpa, availableForPlacement } = body;

        if (!year || !branch || !gender || !tenth_score || !twelfth_score || !father_name || !current_semester || !dob || cgpa === undefined) {
            return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 });
        }

        // Build update object with placement availability if provided
        const updateFields = {
            year,
            branch,
            gender,
            tenth_score,
            twelfth_score,
            father_name,
            current_semester,
            dob: new Date(dob),
            'cgpa.overall': cgpa,
            profile_completed: true,
            redflags: [] // Initialize as empty array as per the model
        };

        // If placement availability is explicitly set (including false), update it
        if (typeof availableForPlacement === 'boolean') {
            updateFields.availableForPlacement = availableForPlacement;
            updateFields.placementAvailabilityUpdatedAt = new Date();
        }

        // --- FIX FOR PUT: Query by 'student_id' field, not '_id' ---
        const updatedStudent = await Student.findOneAndUpdate(
            { student_id: customStudentId }, // <--- CORRECTED LINE: Use your custom student_id field
            updateFields,
            { new: true }
        );

        if (!updatedStudent) {
            return NextResponse.json({ success: false, message: 'Student not found or could not be updated.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Profile updated successfully!', student: updatedStudent });

    } catch (error) {
        console.error('Error updating student profile:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

// show details of student
export async function GET(request) {
    await connectToDb();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.studentId) {
        return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    // This is your custom student_id (e.g., "STU_1749325651632")
    const customStudentId = session.user.studentId; 

    try {
        // --- FIX FOR GET: Use findOne with your custom student_id field ---
        const student = await Student.findOne({ student_id: customStudentId }); // <--- CORRECTED LINE: Use your custom student_id field

        if (!student) {
            return NextResponse.json({ success: false, message: 'Student profile not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: student });
    } catch (error) {
        console.error('Error fetching student profile:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}