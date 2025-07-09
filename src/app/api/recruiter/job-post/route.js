// src/app/api/admin/job-posts/route.js
import connectToDb from "@/lib/db";
import { JobPost } from "@/lib/models/JobPost";
import { Recruiter } from "@/lib/models/Recruiter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Make sure authOptions is exported

import { NextResponse } from "next/server";

export async function GET(request) {
    await connectToDb();

    // Authentication check for admin
    const session = await getServerSession(authOptions);

    // IMPORTANT: Replace 'admin' with the actual role name for your admin users
    if (!session || session.user.role !== 'admin') { // Assuming your session.user has a 'role'
        return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    try {
        const jobPosts = await JobPost.find({}).sort({ createdAt: -1 }); // Get all, sorted by most recent
        return NextResponse.json({ success: true, data: jobPosts });
    } catch (error) {
        console.error('Error fetching job posts:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    await connectToDb();

    try {
        const body = await request.json();

        // Basic validation
        if (!body.organizationName || !body.emailAddress || !body.jobDesignation) {
            return NextResponse.json({ success: false, message: 'Missing required fields (Organization Name, Email, Job Designation).' }, { status: 400 });
        }

        // Auto-create or update recruiter record
        let recruiter = await Recruiter.findOne({ email: body.emailAddress });
        
        if (!recruiter) {
            // Extract recruiter info from the job post form
            const recruiterData = {
                first_name: body.contactPerson ? body.contactPerson.split(' ')[0] : 'Unknown',
                last_name: body.contactPerson ? body.contactPerson.split(' ').slice(1).join(' ') || 'Unknown' : 'Unknown',
                email: body.emailAddress,
                phone: body.mobileNo || body.phone || '',
                company: {
                    name: body.organizationName,
                    website: body.website || '',
                    industry: body.industrySector || 'Other',
                    address: body.contactAddress || '',
                    description: ''
                }
            };

            recruiter = new Recruiter(recruiterData);
            await recruiter.save();
            console.log(`New recruiter created: ${recruiter.email}`);
        } else {
            // Update existing recruiter with latest company info if needed
            if (recruiter.company.name !== body.organizationName) {
                recruiter.company.name = body.organizationName;
                recruiter.company.website = body.website || recruiter.company.website;
                recruiter.company.industry = body.industrySector || recruiter.company.industry;
                recruiter.company.address = body.contactAddress || recruiter.company.address;
                await recruiter.save();
                console.log(`Recruiter updated: ${recruiter.email}`);
            }
        }

        // Process selection process data to convert objects to booleans
        const processedBody = { ...body };
        
        if (body.selectionProcess) {
            processedBody.selectionProcess = {
                aptitudeTest: Boolean(body.selectionProcess.aptitudeTest?.required || body.selectionProcess.aptitudeTest),
                technicalTest: Boolean(body.selectionProcess.technicalTest?.required || body.selectionProcess.technicalTest),
                groupDiscussion: Boolean(body.selectionProcess.groupDiscussion?.required || body.selectionProcess.groupDiscussion),
                personalInterview: Boolean(body.selectionProcess.personalInterview?.required || body.selectionProcess.personalInterview),
                numberOfRounds: body.selectionProcess.personalInterview?.numberOfRounds || body.selectionProcess.numberOfRounds || 1,
                provisionForWaitlist: Boolean(body.selectionProcess.provisionForWaitlist?.required || body.selectionProcess.provisionForWaitlist)
            };
        }

        const newJobPost = new JobPost(processedBody);
        await newJobPost.save();

        return NextResponse.json({ 
            success: true, 
            message: 'Job Post submitted successfully!', 
            data: newJobPost 
        }, { status: 201 });
    } catch (error) {
        console.error('Error submitting job post:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}