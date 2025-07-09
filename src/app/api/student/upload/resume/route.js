// src/app/api/student/upload/resume/route.js
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { saveFile, validateFile, generateFileName, getFileUrl, FileUploadError } from '../../../../../lib/utils/fileUpload';
import { Student } from '../../../../../lib/models/Student';
import  connectToDb from '../../../../../lib/db';
import path from 'path';

export async function POST(request) {
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

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Get student from session
        const student = await Student.findOne({ email: session.user.email });
        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        // Validate file
        validateFile(file, 'resume');

        // Generate file name and save file
        const fileName = generateFileName(file.name, student.student_id, 'resume');
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
        const filePath = await saveFile(file, fileName, uploadDir);
        const fileUrl = getFileUrl(fileName, 'resume');

        // Update student record with resume info
        const updatedStudent = await Student.findOneAndUpdate(
            { student_id: student.student_id },
            {
                'resume.fileName': fileName,
                'resume.originalName': file.name,
                'resume.fileSize': file.size,
                'resume.uploadedAt': new Date(),
                'resume.url': fileUrl
            },
            { new: true }
        );

        return NextResponse.json({
            message: 'Resume uploaded successfully',
            resume: {
                fileName: fileName,
                originalName: file.name,
                fileSize: file.size,
                url: fileUrl,
                uploadedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Resume upload error:', error);
        
        if (error instanceof FileUploadError) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to upload resume' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
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

        // Get student from session
        const student = await Student.findOne({ email: session.user.email });
        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        // Check if student has a resume
        if (!student.resume.fileName) {
            return NextResponse.json(
                { error: 'No resume found to delete' },
                { status: 404 }
            );
        }

        // Delete file from filesystem
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'resumes', student.resume.fileName);
        const { deleteFile } = await import('../../../../../lib/utils/fileUpload');
        await deleteFile(filePath);

        // Clear resume info from database
        await Student.findOneAndUpdate(
            { student_id: student.student_id },
            {
                $unset: {
                    'resume.fileName': 1,
                    'resume.originalName': 1,
                    'resume.fileSize': 1,
                    'resume.uploadedAt': 1,
                    'resume.url': 1
                }
            }
        );

        return NextResponse.json({
            message: 'Resume deleted successfully'
        });

    } catch (error) {
        console.error('Resume deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete resume' },
            { status: 500 }
        );
    }
}
