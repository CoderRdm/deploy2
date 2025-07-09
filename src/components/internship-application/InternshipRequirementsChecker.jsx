'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, GraduationCap, BookOpen } from 'lucide-react';

const InternshipRequirementsChecker = ({ internshipPost, studentProfile, onEligibilityChange }) => {
    // Helper function to check if student's branch is eligible
    const checkBranchEligibility = () => {
        if (!studentProfile?.branch || !internshipPost?.requiredBranches) {
            return { status: 'warning', message: 'Branch information incomplete' };
        }

        if (internshipPost.requiredBranches.allBranchesApplicable) {
            return { status: 'pass', message: 'All branches are eligible' };
        }

        const studentBranch = studentProfile.branch.toLowerCase();
        const studentProgram = studentProfile.degree?.toLowerCase() || '';

        // Check against each program
        const programs = ['btech', 'barch', 'mtech', 'mplan', 'msc', 'mba', 'phd'];
        
        for (const program of programs) {
            const branches = internshipPost.requiredBranches[program] || [];
            if (branches.length > 0) {
                const isEligible = branches.some(branch => 
                    studentBranch.includes(branch.toLowerCase()) || 
                    branch.toLowerCase().includes(studentBranch)
                );
                
                if (isEligible && (studentProgram.includes(program) || program === 'btech')) {
                    return { 
                        status: 'pass', 
                        message: `Your branch (${studentProfile.branch}) is eligible under ${program.toUpperCase()}` 
                    };
                }
            }
        }

        return { 
            status: 'fail', 
            message: `Your branch (${studentProfile.branch}) is not in the eligible branches list` 
        };
    };

    // Helper function to check year eligibility
    const checkYearEligibility = () => {
        if (!studentProfile?.year || !internshipPost?.studentPassingYearForInternship) {
            return { status: 'warning', message: 'Academic year information incomplete' };
        }

        const studentYear = studentProfile.year;
        const eligibleYears = internshipPost.studentPassingYearForInternship;

        if (eligibleYears.length === 0) {
            return { status: 'pass', message: 'No year restrictions specified' };
        }

        const yearMappings = {
            1: ['1st year', 'first year', 'year 1'],
            2: ['2nd year', 'second year', 'year 2'],
            3: ['3rd year', 'third year', 'year 3'],
            4: ['4th year', 'fourth year', 'year 4', 'final year'],
            5: ['5th year', 'fifth year', 'year 5']
        };

        const isEligible = eligibleYears.some(year => {
            const yearOptions = yearMappings[studentYear] || [];
            return yearOptions.some(option => 
                year.toLowerCase().includes(option) || 
                option.includes(year.toLowerCase())
            );
        });

        if (isEligible) {
            return { 
                status: 'pass', 
                message: `Your academic year (Year ${studentYear}) is eligible` 
            };
        }

        return { 
            status: 'fail', 
            message: `Year ${studentYear} students are not eligible. Required: ${eligibleYears.join(', ')}` 
        };
    };

    // Perform basic checks - only academic section and branch validation
    const eligibilityResults = [
        { 
            type: 'Program/Branch', 
            icon: BookOpen, 
            ...checkBranchEligibility() 
        },
        { 
            type: 'Academic Year', 
            icon: GraduationCap, 
            ...checkYearEligibility() 
        }
    ];

    // Determine overall eligibility - for now, just based on basic checks
    const failedRequirements = eligibilityResults.filter(result => result.status === 'fail');
    const isOverallEligible = failedRequirements.length === 0;

    // Notify parent component of eligibility changes
    useEffect(() => {
        if (onEligibilityChange) {
            onEligibilityChange(isOverallEligible, eligibilityResults);
        }
    }, [isOverallEligible, eligibilityResults, onEligibilityChange]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pass':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'fail':
                return <XCircle className="h-5 w-5 text-red-600" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
            default:
                return <AlertTriangle className="h-5 w-5 text-gray-600" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pass':
                return <Badge className="bg-green-100 text-green-800 border-green-200">PASS</Badge>;
            case 'fail':
                return <Badge className="bg-red-100 text-red-800 border-red-200">FAIL</Badge>;
            case 'warning':
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">CHECK</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200">UNKNOWN</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Overall Status */}
            <Alert className={`${isOverallEligible ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                {isOverallEligible ? 
                    <CheckCircle className="h-4 w-4" /> : 
                    <XCircle className="h-4 w-4" />
                }
                <AlertDescription>
                    <strong>
                        {isOverallEligible ? 
                            'Eligibility Confirmed: ' : 
                            'Application Blocked: '
                        }
                    </strong>
                    {isOverallEligible ? 
                        'You meet all the mandatory requirements for this internship.' :
                        `You do not meet the eligibility requirements for ${failedRequirements.map(r => r.type).join(', ')}.`
                    }
                </AlertDescription>
            </Alert>

            {/* Detailed Requirements Check */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Eligibility Requirements Check
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {eligibilityResults.map((result, index) => {
                        const IconComponent = result.icon;
                        return (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-white">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <IconComponent className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm">{result.type}</span>
                                            {getStatusBadge(result.status)}
                                        </div>
                                        <p className="text-sm text-gray-600">{result.message}</p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    {getStatusIcon(result.status)}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Profile Update Reminder */}
            {eligibilityResults.some(result => result.status === 'warning') && (
                <Alert className="border-blue-200 bg-blue-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Profile Update Needed:</strong> Some information in your profile appears to be incomplete. 
                        Please update your profile to ensure accurate eligibility assessment. Incomplete information may affect your application.
                    </AlertDescription>
                </Alert>
            )}

            {/* Requirements Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Internship Requirements Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <strong>Required Programs:</strong> {internshipPost?.requiredPrograms?.join(', ') || 'Not specified'}
                        </div>
                        <div>
                            <strong>CGPA:</strong> {internshipPost?.cgpaRequirements || 'Not specified'}
                        </div>
                        <div>
                            <strong>Academic Year:</strong> {internshipPost?.studentPassingYearForInternship?.join(', ') || 'Not specified'}
                        </div>
                        <div>
                            <strong>Duration:</strong> {internshipPost?.internshipDuration || 'Not specified'}
                        </div>
                    </div>
                    {internshipPost?.anyOtherRequirement && (
                        <div className="pt-2 border-t">
                            <strong>Additional Requirements:</strong>
                            <p className="mt-1 text-gray-600">{internshipPost.anyOtherRequirement}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default InternshipRequirementsChecker;
