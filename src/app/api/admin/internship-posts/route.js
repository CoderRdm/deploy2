import connectToDb from "@/lib/db";
import { InternshipPost } from "@/lib/models/InternshipPost";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(request) {
    await connectToDb();

    // Authentication check for admin
    const session = await getServerSession(authOptions);

    // TEMPORARY: Bypass admin role check for development/testing
    // You MUST re-enable or implement proper admin role check for production!
    // ... (re-enable the role check)
if (!session || session.user.role !== 'admin') { // This check should now be active
    return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required.' }, { status: 401 });
}
// ...
    try {
        const internshipPosts = await InternshipPost.find({}).sort({ createdAt: -1 }); // Get all, sorted by most recent
        return NextResponse.json({ success: true, data: internshipPosts });
    } catch (error) {
        console.error('Error fetching internship posts:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}