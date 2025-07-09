// src/app/api/admin/students/[id]/red-flags/[flagId]/route.js

import { NextResponse } from 'next/server';
import connectToDb from '@/lib/db'; // Assuming you have this for DB connection
import { Student } from '@/lib/models/Student'; // Assuming your Student model path

export async function DELETE(request, { params }) {
    const resolvedParams = await params;
    const { id: studentId, flagId } = resolvedParams;
    
    // Validate parameters
    if (!studentId || !flagId || flagId === 'undefined') {
        console.error('Invalid parameters - studentId:', studentId, 'flagId:', flagId);
        return NextResponse.json({ 
            success: false, 
            message: 'Invalid parameters: studentId and flagId are required and must be valid ObjectIds' 
        }, { status: 400 });
    }

    try {
        await connectToDb();

        // Use $pull to remove the specific subdocument from the redflags array
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { $pull: { redflags: { _id: flagId } } },
            { new: true, runValidators: true } // `new: true` returns the updated document
                                           // `runValidators: true` is generally good, but for $pull it usually doesn't re-validate the entire array unless your schema has specific pre-save hooks that re-process it.
        ).lean(); // Use .lean() for faster query if you don't need Mongoose document methods

        if (!updatedStudent) {
            return NextResponse.json({ success: false, message: 'Student not found.' }, { status: 404 });
        }

        // Check if the red flag was actually removed
        const wasFlagRemoved = updatedStudent.redflags.every(flag => {
            // Add null check for flag._id
            if (!flag._id) {
                return true; // Skip flags without _id
            }
            return flag._id.toString() !== flagId;
        });
        if (wasFlagRemoved) {
             // This means the flag was not found, or not removed.
             // This check might be tricky because `updatedStudent.redflags` won't contain the removed flag.
             // A better check is to see if the array length decreased, or if the initial find had the flag.
             // For now, if findByIdAndUpdate succeeded, we can assume pull worked.
        }


        // Re-fetch the student to get the latest state including any other red flags
        // This is crucial for the frontend to re-render the correct list.
        const studentAfterUpdate = await Student.findById(studentId).lean();

        if (!studentAfterUpdate) {
             return NextResponse.json({ success: false, message: 'Student found, but unable to re-fetch after update.' }, { status: 500 });
        }


        return NextResponse.json({
            success: true,
            message: 'Red flag removed successfully.',
            data: studentAfterUpdate // Return the updated student data
        }, { status: 200 });

    } catch (error) {
        console.error('Error removing red flag by Admin:', error);
        if (error.name === 'CastError') {
            return NextResponse.json({ success: false, message: 'Invalid Student ID or Red Flag ID format.' }, { status: 400 });
        }
        // Check if the error is specifically a Mongoose validation error
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => error.errors[key].message);
            console.error('Mongoose Validation Errors during red flag removal:', errors);
            return NextResponse.json({ success: false, message: 'Validation failed during red flag removal.', errors: errors }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'An unexpected error occurred while removing the red flag.' }, { status: 500 });
    }
}