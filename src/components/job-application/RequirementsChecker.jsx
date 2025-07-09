'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RequirementsChecker = ({ jobPost, studentProfile, onEligibilityChange }) => {
    const [eligibilityResults, setEligibilityResults] = useState([]);
    const [overallEligible, setOverallEligible] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (jobPost && studentProfile) {
            checkEligibility();
        }
    }, [jobPost, studentProfile]);

    useEffect(() => {
        const eligible = eligibilityResults.length > 0 && 
                        eligibilityResults.every(result => result.status !== 'fail');
        setOverallEligible(eligible);
        onEligibilityChange && onEligibilityChange(eligible, eligibilityResults);
    }, [eligibilityResults, onEligibilityChange]);

    const checkEligibility = () => {
        setLoading(true);
        const results = [];

        // Check CGPA Requirements
        if (jobPost.cgpaRequirements && studentProfile.cgpa?.overall) {
            const cgpaResult = checkCGPARequirement(
                jobPost.cgpaRequirements, 
                studentProfile.cgpa.overall
            );
            results.push(cgpaResult);
        }

        // Check Program/Branch Requirements
        const programResult = checkProgramRequirement(
            jobPost.requiredPrograms,
            jobPost.requiredBranches,
            studentProfile
        );
        results.push(programResult);

        // Check Academic Year
        const yearResult = checkYearRequirement(jobPost, studentProfile.year);
        results.push(yearResult);

        // Check Backlogs
        const backlogResult = checkBacklogRequirement(
            jobPost.anyOtherRequirement,
            studentProfile.cgpa?.active_backlogs || 0
        );
        results.push(backlogResult);

        // Check Placement Availability
        const availabilityResult = checkPlacementAvailability(studentProfile);
        results.push(availabilityResult);

        setEligibilityResults(results.filter(result => result !== null));
        setLoading(false);
    };

    const checkCGPARequirement = (requirement, studentCGPA) => {
        const cgpaPattern = /(\d+\.?\d*)/g;
        const matches = requirement.match(cgpaPattern);
        
        if (!matches) {
            return {
                type: 'CGPA',
                requirement: requirement,
                studentValue: studentCGPA,
                status: 'warning',
                message: 'CGPA requirement format unclear - manual verification needed'
            };
        }

        const requiredCGPA = parseFloat(matches[0]);
        const meetsRequirement = studentCGPA >= requiredCGPA;

        return {
            type: 'CGPA',
            requirement: `Minimum ${requiredCGPA} CGPA required`,
            studentValue: studentCGPA,
            status: meetsRequirement ? 'pass' : 'fail',
            message: meetsRequirement 
                ? `✓ Your CGPA (${studentCGPA}) meets the requirement`
                : `✗ Your CGPA (${studentCGPA}) is below the required ${requiredCGPA}`
        };
    };

    const checkProgramRequirement = (requiredPrograms, requiredBranches, student) => {
        if (!requiredPrograms || requiredPrograms.length === 0) {
            return {
                type: 'Program/Branch',
                requirement: 'No specific program restrictions',
                studentValue: `${student.branch || 'Unknown'}`,
                status: 'pass',
                message: '✓ All programs/branches eligible'
            };
        }

        // Check if all branches are applicable
        if (requiredBranches?.allBranchesApplicable) {
            return {
                type: 'Program/Branch',
                requirement: 'All branches applicable',
                studentValue: `${student.branch || 'Unknown'}`,
                status: 'pass',
                message: '✓ All branches are eligible for this position'
            };
        }

        // Determine student's program level based on year
        const programLevel = determineProgramLevel(student.year);
        const studentBranch = student.branch;

        // Check if student's branch is in the required branches for their program
        const eligibleBranches = requiredBranches?.[programLevel] || [];
        const isEligible = eligibleBranches.length === 0 || 
                          eligibleBranches.includes(studentBranch) ||
                          eligibleBranches.includes('All');

        return {
            type: 'Program/Branch',
            requirement: `Required: ${eligibleBranches.join(', ') || 'Any branch'}`,
            studentValue: `${studentBranch} (${programLevel})`,
            status: isEligible ? 'pass' : 'fail',
            message: isEligible 
                ? `✓ Your branch (${studentBranch}) is eligible`
                : `✗ Your branch (${studentBranch}) is not in the eligible list`
        };
    };

    const checkYearRequirement = (jobPost, studentYear) => {
        // Most job posts are for final year students
        const eligibleYears = ['4th', '4', 'Alumni'];
        const isEligible = eligibleYears.includes(studentYear);

        return {
            type: 'Academic Year',
            requirement: 'Final year or Alumni students',
            studentValue: studentYear,
            status: isEligible ? 'pass' : 'warning',
            message: isEligible 
                ? `✓ Your academic year (${studentYear}) is eligible`
                : `⚠ Job typically for final year students. Your year: ${studentYear}`
        };
    };

    const checkBacklogRequirement = (otherRequirements, activeBacklogs) => {
        if (!otherRequirements) {
            return {
                type: 'Academic Standing',
                requirement: 'No specific backlog restrictions mentioned',
                studentValue: `${activeBacklogs} active backlogs`,
                status: activeBacklogs === 0 ? 'pass' : 'warning',
                message: activeBacklogs === 0 
                    ? '✓ No active backlogs'
                    : `⚠ You have ${activeBacklogs} active backlogs - verify with company policy`
            };
        }

        const hasBacklogRestriction = otherRequirements.toLowerCase().includes('no backlog') ||
                                     otherRequirements.toLowerCase().includes('no pending') ||
                                     otherRequirements.toLowerCase().includes('clear academic');
        
        if (hasBacklogRestriction) {
            return {
                type: 'Academic Standing',
                requirement: 'No backlogs allowed',
                studentValue: `${activeBacklogs} active backlogs`,
                status: activeBacklogs === 0 ? 'pass' : 'fail',
                message: activeBacklogs === 0 
                    ? '✓ No active backlogs - meets requirement'
                    : `✗ You have ${activeBacklogs} active backlogs but company requires clear academic record`
            };
        }

        return {
            type: 'Academic Standing',
            requirement: 'Check other requirements',
            studentValue: `${activeBacklogs} active backlogs`,
            status: 'warning',
            message: `⚠ You have ${activeBacklogs} active backlogs - review company requirements carefully`
        };
    };

    const checkPlacementAvailability = (student) => {
        return {
            type: 'Placement Status',
            requirement: 'Student must be available for placement',
            studentValue: student.availableForPlacement ? 'Available' : 'Not Available',
            status: student.availableForPlacement ? 'pass' : 'fail',
            message: student.availableForPlacement 
                ? '✓ You are available for placement'
                : '✗ You must mark yourself available for placement to apply'
        };
    };

    const determineProgramLevel = (year) => {
        switch (year) {
            case '1st':
            case '1':
            case '2nd':
            case '2':
            case '3rd':
            case '3':
            case '4th':
            case '4':
                return 'btech';
            default:
                return 'btech'; // Default assumption
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pass':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'fail':
                return <XCircle className="h-5 w-5 text-red-600" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            default:
                return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'pass':
                return 'default'; // Green
            case 'fail':
                return 'destructive'; // Red
            case 'warning':
                return 'secondary'; // Yellow
            default:
                return 'outline'; // Blue
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Checking Eligibility...</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(overallEligible ? 'pass' : 'fail')}
                    Eligibility Requirements Check
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Alert className={`mb-4 ${overallEligible ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <AlertDescription>
                        <strong>
                            {overallEligible 
                                ? '✓ You meet all basic requirements for this position!'
                                : '✗ You do not meet some requirements. Please review carefully.'
                            }
                        </strong>
                    </AlertDescription>
                </Alert>

                <div className="space-y-4">
                    {eligibilityResults.map((result, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                            {getStatusIcon(result.status)}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{result.type}</span>
                                    <Badge variant={getStatusBadgeVariant(result.status)}>
                                        {result.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                    <strong>Requirement:</strong> {result.requirement}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">
                                    <strong>Your Status:</strong> {result.studentValue}
                                </p>
                                <p className="text-sm font-medium">{result.message}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {!overallEligible && (
                    <Alert className="mt-4 border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Application Blocked:</strong> You do not meet the mandatory eligibility requirements for this position. 
                            Applications are only accepted from candidates who satisfy all basic requirements. 
                            Please update your profile or contact the placement office if you believe there's an error.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

export default RequirementsChecker;
