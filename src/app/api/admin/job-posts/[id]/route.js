// src/app/api/admin/job-posts/[id]/route.js
import { JobPost } from "@/lib/models/JobPost";
import connectToDb from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    // 1. Ensure DB connection is successful
    try {
        await connectToDb();
    } catch (dbError) {
        console.error("Database connection failed:", dbError);
        return NextResponse.json({ success: false, message: 'Database connection error.' }, { status: 500 });
    }

    // 2. Auth check - usually not the cause of JSON parsing errors, but good to verify
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
        // Ensure this sends valid JSON for unauthorized access
        return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const { id } = await params || {};

    // 3. Main logic and error handling
    try {
        // Add a console log here to see if the ID is correct and if the query starts
        console.log(`Attempting to fetch JobPost with ID: ${id}`);
        const jobPost = await JobPost.findById(id).populate('applications.student', 'name email student_id branch year cgpa resume');

        if (!jobPost) {
            console.log(`Job post with ID ${id} not found.`); // Log if not found
            // Ensure this sends valid JSON for not found
            return NextResponse.json({ success: false, message: 'Job post not found.' }, { status: 404 });
        }

        console.log(`Successfully fetched job post: ${jobPost._id}`); // Log successful fetch
        return NextResponse.json({ success: true, data: jobPost });
    } catch (error) {
        // THIS IS THE MOST LIKELY PLACE FOR THE ERROR TO ORIGINATE
        console.error('SERVER ERROR: Error fetching job post by ID:', error);
        // Ensure this catch block always returns valid JSON for any backend error
        return NextResponse.json({ success: false, message: 'Internal Server Error fetching job post.' }, { status: 500 });
    }
}