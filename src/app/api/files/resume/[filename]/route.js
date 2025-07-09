// src/app/api/files/resume/[filename]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Student } from '../../../../../lib/models/Student';
import  connectToDb from '../../../../../lib/db';
import path from 'path';
import fs from 'fs/promises';

export async function GET(request, { params }) {
    try {
        // Check authentication
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Connect to database
        await connectToDb();

        // Await params in Next.js 15
        const resolvedParams = await params;
        const { filename } = resolvedParams;

        // Verify the file belongs to the current user or they have permission to view it
        const student = await Student.findOne({ 
            $or: [
                { email: session.user.email },
                { 'resume.fileName': filename }
            ]
        });

        if (!student) {
            return NextResponse.json(
                { error: 'File not found or access denied' },
                { status: 404 }
            );
        }

        // Check if the requesting user has permission to access this file
        // Students can only access their own resume, admin/recruiters might have broader access
        const requestingStudent = await Student.findOne({ email: session.user.email });
        
        if (requestingStudent && student.student_id !== requestingStudent.student_id) {
            // For now, only allow students to access their own resumes
            // You can modify this logic to allow recruiters/admins to access any resume
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        // Construct file path
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'resumes', filename);

        try {
            // Check if file exists
            await fs.access(filePath);
            
            // Read file
            const fileBuffer = await fs.readFile(filePath);
            
            // Determine content type based on file extension
            const ext = path.extname(filename).toLowerCase();
            let contentType = 'application/octet-stream';
            
            switch (ext) {
                case '.pdf':
                    contentType = 'application/pdf';
                    break;
                case '.doc':
                    contentType = 'application/msword';
                    break;
                case '.docx':
                    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    break;
            }

            // Return file with appropriate headers
            return new NextResponse(fileBuffer, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `inline; filename="${student.resume.originalName || filename}"`,
                    'Cache-Control': 'private, max-age=3600',
                },
            });

        } catch (fileError) {
            console.error('File access error:', fileError);
            return NextResponse.json(
                { error: 'File not found on server' },
                { status: 404 }
            );
        }

    } catch (error) {
        console.error('File serving error:', error);
        return NextResponse.json(
            { error: 'Failed to serve file' },
            { status: 500 }
        );
    }
}
