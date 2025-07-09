// src/app/api/spc/students/[id]/red-flags/[flagId]/route.js

import { getServerSession } from "next-auth";
import { Student } from "@/lib/models/Student"; // Assuming your Student model path is correct
import connectToDb from "@/lib/db"; // Assuming your DB connection utility
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ... (your existing PATCH function remains the same as you provided)
export async function PATCH(request, { params }) {
    await connectToDb();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'student' || !session.user.isSPC) {
        return NextResponse.json({ success: false, message: 'Unauthorized: SPC privileges required.' }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id, flagId } = resolvedParams;

    const { reason } = await request.json();

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        return NextResponse.json({ success: false, message: 'New reason for red flag is required.' }, { status: 400 });
    }

    try {
        const student = await Student.findById(id);
        if (!student) { return NextResponse.json({ success: false, message: 'Student not found.' }, { status: 404 }); }

        const redFlag = student.redflags.id(flagId);
        if (!redFlag) { return NextResponse.json({ success: false, message: 'Red flag not found.' }, { status: 404 }); }

        // Ensure SPC can only update their own flags (if desired)
        // Convert assignedById to string for comparison if it's an ObjectId
        if (redFlag.assignedById.toString() !== session.user.id) {
            return NextResponse.json({ success: false, message: 'Forbidden: You can only update red flags you assigned.' }, { status: 403 });
        }

        redFlag.reason = reason.trim();
        await student.save(); // This will re-validate the student document, but for PATCH,
                              // you are explicitly modifying one subdocument, not removing,
                              // so it should be fine if all existing red flags are valid.

        return NextResponse.json({
            success: true,
            message: 'Red flag updated successfully.',
            data: redFlag
        });

    } catch (error) {
        console.error('Error updating red flag:', error);
        if (error.name === 'CastError') {
            return NextResponse.json({ success: false, message: 'Invalid Student ID or Red Flag ID format.' }, { status: 400 });
        }
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            console.error('Mongoose Validation Errors during PATCH:', errors);
            return NextResponse.json({ success: false, message: 'Validation failed during red flag update.', errors: errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}


export async function DELETE(request, { params }) {
    await connectToDb();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'student' || !session.user.isSPC) {
        return NextResponse.json({ success: false, message: 'Unauthorized: SPC privileges required.' }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id: studentId, flagId } = resolvedParams; // Renamed 'id' to 'studentId' for clarity

    try {
        // First, verify the red flag exists and belongs to the current SPC user
        const student = await Student.findById(studentId);
        if (!student) {
            return NextResponse.json({ success: false, message: 'Student not found.' }, { status: 404 });
        }

        const redFlagToDelete = student.redflags.id(flagId);
        if (!redFlagToDelete) {
            return NextResponse.json({ success: false, message: 'Red flag not found.' }, { status: 404 });
        }

        // Ensure SPC can only delete their own flags
        // Convert assignedById to string for comparison if it's an ObjectId
        if (redFlagToDelete.assignedById.toString() !== session.user.id) {
            return NextResponse.json({ success: false, message: 'Forbidden: You can only delete red flags you assigned.' }, { status: 403 });
        }

        // Use $pull to remove the specific subdocument from the redflags array
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { $pull: { redflags: { _id: flagId } } },
            { new: true, runValidators: true } // `new: true` returns the updated document
                                           // `runValidators: true` can be kept, it won't trigger re-validation of other array elements for $pull
        ).lean(); // Use .lean() for faster query if you don't need Mongoose document methods

        if (!updatedStudent) {
            // This case should ideally not happen if student was found initially,
            // but good for robustness.
            return NextResponse.json({ success: false, message: 'Failed to update student after red flag removal.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Red flag deleted successfully.',
            data: updatedStudent // Return the updated student data (with the flag removed)
        }, { status: 200 });

    } catch (error) {
        console.error('Error deleting red flag:', error);
        if (error.name === 'CastError') {
            return NextResponse.json({ success: false, message: 'Invalid Student ID or Red Flag ID format.' }, { status: 400 });
        }
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            console.error('Mongoose Validation Errors during red flag deletion:', errors);
            return NextResponse.json({ success: false, message: 'Validation failed during red flag deletion.', errors: errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}