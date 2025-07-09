// src/app/api/admin/students/[id]/toggle-spc/route.js

import { getServerSession } from "next-auth";
import { Student } from "@/lib/models/Student";
import connectToDb from "@/lib/db";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request, { params }) {
    await connectToDb();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'admin') {
        console.warn('Unauthorized attempt to toggle SPC status from user:', session?.user?.email || 'N/A');
        return NextResponse.json({ success: false, message: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { isSPC } = await request.json();

    if (typeof isSPC !== 'boolean') {
        return NextResponse.json({ success: false, message: 'Invalid value for isSPC. Must be true or false.' }, { status: 400 });
    }

    try {
        const student = await Student.findById(id);

        if (!student) {
            return NextResponse.json({ success: false, message: 'Student not found.' }, { status: 404 });
        }

        // --- NEW LOGIC: Prevent becoming SPC if has red flags ---
        if (isSPC === true && student.redflags && student.redflags.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Cannot assign SPC role to ${student.name} as they have existing red flags. Please resolve red flags first.`
                },
                { status: 400 } // Bad Request or Forbidden, depending on your preference
            );
        }
        // --- END NEW LOGIC ---

        student.isSPC = isSPC;
        await student.save();

        return NextResponse.json({
            success: true,
            message: `Student ${student.name}'s SPC status updated to ${isSPC ? 'enabled' : 'disabled'}.`,
            data: { studentId: student._id, isSPC: student.isSPC }
        });

    } catch (error) {
        console.error('Error toggling student SPC status:', error);
        if (error.name === 'CastError') {
            return NextResponse.json({ success: false, message: 'Invalid Student ID format.' }, { status: 400 });
        }
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            console.error('Mongoose Validation Errors:', errors);
            return NextResponse.json({ success: false, message: 'Validation Error', errors: errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}