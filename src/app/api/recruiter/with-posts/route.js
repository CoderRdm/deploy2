// src/app/api/admin/recruiter/with-posts/route.js
import connectToDb from "@/lib/db";
// Adjust import paths for models based on the new route's depth
import { Recruiter } from '@/lib/models/Recruiter'; // Go up 4 levels to src, then into lib/models
import { InternshipPost } from '@/lib/models/InternshipPost';
import { JobPost } from '@/lib/models/JobPost';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(request) {
    await connectToDb();

    // Authentication check for admin
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    try {
        // Fetch all recruiters
        const recruiters = await Recruiter.find({});
        
        // Fetch all job and internship posts
        const jobPosts = await JobPost.find({});
        const internshipPosts = await InternshipPost.find({});

        // Create a map to store counts for each recruiter
        const recruiterDataMap = new Map(); // Using Map for direct access by email

        // Initialize map with recruiter data
        recruiters.forEach(recruiter => {
            recruiterDataMap.set(recruiter.email, {
                _id: recruiter._id.toString(),
                companyName: recruiter.company ? recruiter.company.name : 'N/A', // Handle case if company subdocument is missing
                email: recruiter.email,
                createdAt: recruiter.createdAt,
                jnfCount: 0,
                infCount: 0,
            });
        });

        // Count JNFs
        jobPosts.forEach(post => {
            // Assuming post.emailAddress links to recruiter.email
            if (recruiterDataMap.has(post.emailAddress)) {
                const recruiter = recruiterDataMap.get(post.emailAddress);
                recruiter.jnfCount++;
                recruiterDataMap.set(post.emailAddress, recruiter); // Update map
            }
        });

        // Count INFs
        internshipPosts.forEach(post => {
            // Assuming post.emailAddress links to recruiter.email
            if (recruiterDataMap.has(post.emailAddress)) {
                const recruiter = recruiterDataMap.get(post.emailAddress);
                recruiter.infCount++;
                recruiterDataMap.set(post.emailAddress, recruiter); // Update map
            }
        });

        // Convert map values back to an array for the response
        const aggregatedRecruiters = Array.from(recruiterDataMap.values());

        return NextResponse.json({ success: true, data: aggregatedRecruiters });

    } catch (error) {
        console.error('Error fetching recruiters with post counts:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}