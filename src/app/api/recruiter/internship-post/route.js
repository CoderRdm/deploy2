// src/app/api/recruiter/internship-post/route.js
import connectToDb from "@/lib/db";
import { InternshipPost } from "@/lib/models/InternshipPost";
import { Recruiter } from "@/lib/models/Recruiter";
import { NextResponse } from "next/server";

export async function POST(request) {
    await connectToDb();

    try {
        const body = await request.json();

        // Basic validation
        if (!body.organizationName || !body.emailAddress || !body.internshipProfile) {
            return NextResponse.json({ success: false, message: 'Missing required fields (Organization Name, Email, Internship Profile).' }, { status: 400 });
        }

        // Auto-create or update recruiter record
        let recruiter = await Recruiter.findOne({ email: body.emailAddress });
        
        if (!recruiter) {
            // Extract recruiter info from the internship post form
            const recruiterData = {
                first_name: body.contactPerson ? body.contactPerson.split(' ')[0] : 'Unknown',
                last_name: body.contactPerson ? body.contactPerson.split(' ').slice(1).join(' ') || 'Unknown' : 'Unknown',
                email: body.emailAddress,
                phone: body.mobileNo || '',
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

        const newInternshipPost = new InternshipPost(body);
        await newInternshipPost.save();

        return NextResponse.json({ 
            success: true, 
            message: 'Internship Post submitted successfully!', 
            data: newInternshipPost 
        }, { status: 201 });
    } catch (error) {
        console.error('Error submitting internship post:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}