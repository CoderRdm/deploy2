// src/app/api/spc/students/[id]/red-flags/route.js
import { getServerSession } from "next-auth";
import { Student } from "@/lib/models/Student";
import connectToDb from "@/lib/db";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request, { params }) {
    await connectToDb();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'student' || !session.user.isSPC) {
        return NextResponse.json({ success: false, message: 'Unauthorized: SPC privileges required.' }, { status: 403 });
    }

    // --- FIX FOR PARAMS: Await params before destructuring ---
    const resolvedParams = await params;
    const { id } = resolvedParams; // <--- CHANGED: Destructure from awaited params
    // --- END FIX FOR PARAMS ---

    const { reason } = await request.json();

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        return NextResponse.json({ success: false, message: 'Red flag reason is required.' }, { status: 400 });
    }

    try {
        const student = await Student.findById(id);

        if (!student) {
            return NextResponse.json({ success: false, message: 'Student not found.' }, { status: 404 });
        }

        const newRedFlag = {
            reason: reason.trim(),
            // --- FIX FOR addedBy: Ensure session.user.name or email is available ---
            assignedBy: session.user.name || session.user.email, // Ensure this is not null/undefined
            assignedById: session.user.id, // Use session.user.id (MongoDB _id) for SPC, more consistent
                                          // Previously, you used studentId, but if SPCs have their own Student _id, that's better.
                                          // If SPC is admin-like, then assignedById should be admin's _id.
                                          // Let's use session.user.id, which is the logged-in user's MongoDB _id.
            createdAt: new Date(), // Explicitly set the creation timestamp
            updatedAt: new Date() // Explicitly set the update timestamp
        };

        student.redflags.push(newRedFlag);
        await student.save();

        return NextResponse.json({
            success: true,
            message: `Red flag added to student ${student.name}.`,
            data: student.redflags
        });

    } catch (error) {
        console.error('Error adding red flag:', error);
        if (error.name === 'CastError') {
            return NextResponse.json({ success: false, message: 'Invalid Student ID format.' }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}