// src/app/api/admin/recruiters/[id]/posts/route.js
import connectToDb from "@/lib/db";
import { Recruiter } from '@/lib/models/Recruiter';
import { InternshipPost } from '@/lib/models/InternshipPost';
import { JobPost } from '@/lib/models/JobPost';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    await connectToDb();

    // Authentication check for admin
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    try {
        const { id } = params;
        
        // Find the recruiter by ID
        const recruiter = await Recruiter.findById(id);
        
        if (!recruiter) {
            return NextResponse.json({ success: false, message: 'Recruiter not found' }, { status: 404 });
        }

        // Fetch all job and internship posts for this recruiter based on email
        const jobPosts = await JobPost.find({ emailAddress: recruiter.email }).sort({ createdAt: -1 });
        const internshipPosts = await InternshipPost.find({ emailAddress: recruiter.email }).sort({ createdAt: -1 });

        // Combine and sort all posts by creation date
        const allPosts = [
            ...jobPosts.map(post => ({
                ...post.toObject(),
                type: 'job',
                createdAt: post.createdAt
            })),
            ...internshipPosts.map(post => ({
                ...post.toObject(),
                type: 'internship',
                createdAt: post.createdAt
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return NextResponse.json({ 
            success: true, 
            data: {
                recruiter: {
                    _id: recruiter._id,
                    companyName: recruiter.company?.name || 'N/A',
                    email: recruiter.email,
                    firstName: recruiter.first_name,
                    lastName: recruiter.last_name,
                    phone: recruiter.phone,
                    createdAt: recruiter.createdAt
                },
                posts: allPosts,
                stats: {
                    totalPosts: allPosts.length,
                    jobPosts: jobPosts.length,
                    internshipPosts: internshipPosts.length
                }
            }
        });

    } catch (error) {
        console.error('Error fetching recruiter posts:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
