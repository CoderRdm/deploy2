// src/app/api/admin/students/available/route.js
import connectToDb from "@/lib/db";
import { Student } from "@/lib/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(request) {
    await connectToDb();

    // Authentication check for admin
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'admin') {
        console.warn(`Unauthorized access attempt to /api/admin/students/available from user: ${session?.user?.email || 'unauthenticated'}`);
        return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    try {
        // Get query parameters for filtering
        const { searchParams } = new URL(request.url);
        const branch = searchParams.get('branch');
        const year = searchParams.get('year');
        const minCGPA = searchParams.get('minCGPA');

        // Build query filter
        let filter = { 
            availableForPlacement: true,
            profile_completed: true
        };

        if (branch && branch !== 'all') {
            filter.branch = branch;
        }

        if (year && year !== 'all') {
            filter.year = year;
        }

        if (minCGPA && !isNaN(parseFloat(minCGPA))) {
            filter['cgpa.overall'] = { $gte: parseFloat(minCGPA) };
        }

        // Fetch available students with basic info
        const students = await Student.find(filter)
            .select('student_id name email year branch cgpa.overall tenth_score twelfth_score gender availableForPlacement placementAvailabilityUpdatedAt redflags createdAt')
            .sort({ placementAvailabilityUpdatedAt: -1 }); // Most recently marked available first

        // Calculate statistics
        const stats = {
            total: students.length,
            byBranch: {},
            byYear: {},
            averageCGPA: 0
        };

        // Calculate statistics
        let totalCGPA = 0;
        let cgpaCount = 0;

        students.forEach(student => {
            // Branch statistics
            if (!stats.byBranch[student.branch]) {
                stats.byBranch[student.branch] = 0;
            }
            stats.byBranch[student.branch]++;

            // Year statistics
            if (!stats.byYear[student.year]) {
                stats.byYear[student.year] = 0;
            }
            stats.byYear[student.year]++;

            // CGPA calculation
            if (student.cgpa && student.cgpa.overall) {
                totalCGPA += student.cgpa.overall;
                cgpaCount++;
            }
        });

        if (cgpaCount > 0) {
            stats.averageCGPA = (totalCGPA / cgpaCount).toFixed(2);
        }

        return NextResponse.json({ 
            success: true, 
            data: students,
            stats: stats,
            message: `Found ${students.length} students available for placement.`
        });
    } catch (error) {
        console.error('Error fetching available students:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
