// src/app/api/admin/students/placement-tracking/route.js
import connectToDb from "@/lib/db";
import { Student } from "@/lib/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// GET - Fetch all students with their placement status
export async function GET(request) {
    await connectToDb();
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json(
            { success: false, message: 'Unauthorized: Admin access required.' },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // 'selected', 'applied', 'all'
        const company = searchParams.get('company');
        const position = searchParams.get('position');

        let matchConditions = {};
        
        // Build aggregation pipeline to get students with their application status
        const pipeline = [
            {
                $addFields: {
                    allApplications: {
                        $concatArrays: [
                            { $ifNull: ["$companyApplications.jobs", []] },
                            { $ifNull: ["$companyApplications.internships", []] }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    selectedApplications: {
                        $filter: {
                            input: "$allApplications",
                            cond: { $eq: ["$$this.currentStatus", "Selected"] }
                        }
                    },
                    appliedApplications: {
                        $filter: {
                            input: "$allApplications",
                            cond: { $ne: ["$$this.currentStatus", "Rejected"] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    hasSelections: { $gt: [{ $size: "$selectedApplications" }, 0] },
                    hasApplications: { $gt: [{ $size: "$appliedApplications" }, 0] },
                    totalApplications: { $size: "$allApplications" },
                    totalSelections: { $size: "$selectedApplications" }
                }
            }
        ];

        // Add filtering based on status
        if (status === 'selected') {
            pipeline.push({ $match: { hasSelections: true } });
        } else if (status === 'applied') {
            pipeline.push({ $match: { hasApplications: true } });
        }

        // Add company filter if specified
        if (company) {
            pipeline.push({
                $match: {
                    $or: [
                        { "companyApplications.jobs.companyName": { $regex: company, $options: 'i' } },
                        { "companyApplications.internships.companyName": { $regex: company, $options: 'i' } }
                    ]
                }
            });
        }

        // Add position filter if specified
        if (position) {
            pipeline.push({
                $match: {
                    $or: [
                        { "companyApplications.jobs.position": { $regex: position, $options: 'i' } },
                        { "companyApplications.internships.position": { $regex: position, $options: 'i' } }
                    ]
                }
            });
        }

        // Project only necessary fields
        pipeline.push({
            $project: {
                student_id: 1,
                name: 1,
                email: 1,
                year: 1,
                branch: 1,
                cgpa: 1,
                selectedApplications: 1,
                appliedApplications: 1,
                totalApplications: 1,
                totalSelections: 1,
                hasSelections: 1,
                hasApplications: 1,
                placements: 1,
                createdAt: 1
            }
        });

        pipeline.push({ $sort: { totalSelections: -1, totalApplications: -1, name: 1 } });

        const students = await Student.aggregate(pipeline);

        // Calculate statistics
        const stats = {
            totalStudents: students.length,
            studentsWithApplications: students.filter(s => s.hasApplications).length,
            studentsWithSelections: students.filter(s => s.hasSelections).length,
            totalApplications: students.reduce((sum, s) => sum + s.totalApplications, 0),
            totalSelections: students.reduce((sum, s) => sum + s.totalSelections, 0),
            placementRate: students.length > 0 
                ? ((students.filter(s => s.hasSelections).length / students.length) * 100).toFixed(2)
                : 0
        };

        return NextResponse.json({
            success: true,
            data: students,
            stats,
            message: `Found ${students.length} students`
        });

    } catch (error) {
        console.error('Error fetching student placement tracking:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// PATCH - Update student placement status or add placement entry
export async function PATCH(request) {
    await connectToDb();
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json(
            { success: false, message: 'Unauthorized: Admin access required.' },
            { status: 401 }
        );
    }

    try {
        const { studentId, action, placementData } = await request.json();

        if (!studentId || !action) {
            return NextResponse.json(
                { success: false, message: 'Student ID and action are required' },
                { status: 400 }
            );
        }

        let updateQuery = {};
        let successMessage = '';

        switch (action) {
            case 'add_final_placement':
                if (!placementData?.companyName || !placementData?.position) {
                    return NextResponse.json(
                        { success: false, message: 'Company name and position are required for final placement' },
                        { status: 400 }
                    );
                }
                
                updateQuery = {
                    $set: {
                        'placements.finalJob': {
                            ...placementData,
                            placedDate: new Date(),
                            isCurrentJob: true
                        }
                    }
                };
                successMessage = 'Final placement added successfully';
                break;

            case 'remove_final_placement':
                updateQuery = {
                    $unset: { 'placements.finalJob': "" }
                };
                successMessage = 'Final placement removed successfully';
                break;

            case 'add_internship_completion':
                if (!placementData?.companyName || !placementData?.position) {
                    return NextResponse.json(
                        { success: false, message: 'Company name and position are required for internship completion' },
                        { status: 400 }
                    );
                }
                
                updateQuery = {
                    $push: {
                        'placements.internshipsCompleted': {
                            ...placementData,
                            completionStatus: placementData.completionStatus || 'Completed'
                        }
                    }
                };
                successMessage = 'Internship completion added successfully';
                break;

            default:
                return NextResponse.json(
                    { success: false, message: 'Invalid action specified' },
                    { status: 400 }
                );
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            updateQuery,
            { new: true, select: 'student_id name email placements companyApplications' }
        );

        if (!updatedStudent) {
            return NextResponse.json(
                { success: false, message: 'Student not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: successMessage,
            data: updatedStudent
        });

    } catch (error) {
        console.error('Error updating student placement:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
