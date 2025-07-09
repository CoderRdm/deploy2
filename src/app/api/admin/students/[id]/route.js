// src/app/api/admin/students/[id]/route.js
import connectToDb from "@/lib/db";
import { Student } from "@/lib/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// Re-including GET and DELETE for context, but focus on PATCH
export async function GET(request, { params }) {
    await connectToDb();
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required.' }, { status: 401 });
    }
    try {
        const { id } = await params; // Await params
        if (!id) {
            return NextResponse.json({ success: false, message: 'Student ID is required.' }, { status: 400 });
        }
        const student = await Student.findById(id);
        if (!student) {
            return NextResponse.json({ success: false, message: 'Student not found.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: student });
    } catch (error) {
        console.error('Error fetching student:', error);
        if (error.name === 'CastError') {
            return NextResponse.json({ success: false, message: 'Invalid Student ID format.' }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    await connectToDb();
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required.' }, { status: 401 });
    }
    try {
        const { id } = await params; // Await params
        if (!id) {
            return NextResponse.json({ success: false, message: 'Student ID is required.' }, { status: 400 });
        }
        const deletedStudent = await Student.findByIdAndDelete(id);
        if (!deletedStudent) {
            return NextResponse.json({ success: false, message: 'Student not found.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Student deleted successfully.' });
    } catch (error) {
        console.error('Error deleting student:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

// --- ADD THIS PATCH METHOD ---
export async function PATCH(request, { params }) {
    await connectToDb();
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required.' }, { status: 401 });
    }
    try {
        const { id } = await params; // Await params for dynamic route parameter
        if (!id) {
            return NextResponse.json({ success: false, message: 'Student ID is required.' }, { status: 400 });
        }

        const body = await request.json();
        const { reason, type } = body;

        // Handle different types of PATCH operations
        if (type === 'add_red_flag') {
            if (!reason || reason.trim() === '') {
                return NextResponse.json({ success: false, message: 'Red flag reason is required.' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ success: false, message: 'Invalid PATCH operation type.' }, { status: 400 });
        }

        // Use $push to add a new item to the redflags array
        const student = await Student.findByIdAndUpdate(
            id,
            { 
                $push: { 
                    redflags: { 
                        reason: reason, 
                        assignedBy: session.user.email, // Store the email of the admin who added it
                        assignedById: session.user.id, // Store the admin ID
                        createdAt: new Date(), // Explicitly set the creation timestamp
                        updatedAt: new Date() // Explicitly set the update timestamp
                    } 
                }
            },
            { new: true } // Return the updated document
        );

        if (!student) {
            return NextResponse.json({ success: false, message: 'Student not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Red flag added successfully.', data: student });
    } catch (error) {
        console.error('Error adding red flag to student:', error);
        if (error.name === 'CastError') {
            return NextResponse.json({ success: false, message: 'Invalid Student ID format.' }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
// --- END PATCH METHOD ---