'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Building2, 
    Clock, 
    MapPin, 
    Calendar, 
    Users, 
    DollarSign, 
    FileText, 
    CheckCircle, 
    AlertCircle,
    Info,
    ArrowLeft,
    ExternalLink
} from 'lucide-react';

import InternshipRequirementsChecker from './InternshipRequirementsChecker';
import InternshipApplicationForm from './InternshipApplicationForm';

const EnhancedInternshipDetails = ({ 
    internshipPost, 
    studentProfile, 
    hasApplied: initialHasApplied = false,
    onBack 
}) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [hasApplied, setHasApplied] = useState(initialHasApplied);
    const [eligibilityResults, setEligibilityResults] = useState(null);
    const [isEligible, setIsEligible] = useState(false);

    useEffect(() => {
        // Calculate eligibility when component mounts or data changes
        if (internshipPost && studentProfile) {
            calculateEligibility();
        }
    }, [internshipPost, studentProfile]);

    const calculateEligibility = () => {
        // Simplified eligibility check - only checking academic year and branch
        const checks = [];
        
        // Branch Check
        if (!internshipPost?.requiredBranches?.allBranchesApplicable) {
            const studentBranch = studentProfile?.branch?.toLowerCase() || '';
            const studentProgram = studentProfile?.degree?.toLowerCase() || '';
            const programs = ['btech', 'barch', 'mtech', 'mplan', 'msc', 'mba', 'phd'];
            let branchEligible = false;
            
            for (const program of programs) {
                const branches = internshipPost?.requiredBranches?.[program] || [];
                if (branches.length > 0) {
                    const isEligible = branches.some(branch => 
                        studentBranch.includes(branch.toLowerCase()) || 
                        branch.toLowerCase().includes(studentBranch)
                    );
                    if (isEligible && (studentProgram.includes(program) || program === 'btech')) {
                        branchEligible = true;
                        break;
                    }
                }
            }
            
            if (!branchEligible && studentBranch) {
                checks.push({ type: 'Branch', status: 'fail' });
            }
        }

        // Academic Year Check
        if (internshipPost?.studentPassingYearForInternship?.length > 0) {
            const studentYear = studentProfile?.year;
            const eligibleYears = internshipPost.studentPassingYearForInternship;
            
            if (studentYear) {
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

                if (!isEligible) {
                    checks.push({ type: 'Academic Year', status: 'fail' });
                }
            }
        }

        const failedChecks = checks.filter(check => check.status === 'fail');
        const eligible = failedChecks.length === 0;
        
        setEligibilityResults(checks);
        setIsEligible(eligible);
    };

    const handleApplicationSubmit = (success) => {
        if (success) {
            setHasApplied(true);
            setActiveTab('apply'); // Stay on apply tab to show success message
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateArray = (dateArray) => {
        if (!dateArray || dateArray.length === 0) return 'Not specified';
        return dateArray.map(date => formatDate(date)).join(', ');
    };

    if (!internshipPost) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Internship details not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                {onBack && (
                    <Button 
                        variant="outline" 
                        onClick={onBack}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                )}
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {internshipPost.internshipProfile}
                    </h1>
                    <p className="text-xl text-gray-600 mt-1">
                        {internshipPost.organizationName}
                    </p>
                </div>
                {hasApplied && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Applied
                    </Badge>
                )}
            </div>

            {/* Key Information Bar */}
            <Card>
                <CardContent className="py-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span><strong>Posted:</strong> {formatDate(internshipPost.dateSubmitted)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span><strong>Duration:</strong> {internshipPost.internshipDuration || 'As specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span><strong>Location:</strong> {internshipPost.placeOfPosting || 'Multiple locations'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span><strong>Positions:</strong> {internshipPost.numberOfPositions || 'Multiple'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="eligibility">Eligibility Check</TabsTrigger>
                    <TabsTrigger value="apply" disabled={!isEligible && !hasApplied}>
                        Apply Now
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Company Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Company Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Organization</label>
                                    <p className="text-lg font-semibold">{internshipPost.organizationName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Type</label>
                                    <p>{internshipPost.organizationType}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Industry</label>
                                    <p>{internshipPost.industrySector}</p>
                                </div>
                                {internshipPost.website && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Website</label>
                                        <a 
                                            href={internshipPost.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                        >
                                            Visit Website <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Internship Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Internship Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Profile</label>
                                <p className="text-lg font-semibold">{internshipPost.internshipProfile}</p>
                            </div>
                            {internshipPost.internshipDescription && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Description</label>
                                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                                        <p className="whitespace-pre-wrap">{internshipPost.internshipDescription}</p>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Duration</label>
                                    <p>{internshipPost.internshipDuration || 'To be decided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                                    <p>{formatDate(internshipPost.tentativeDateOfJoining)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Location</label>
                                    <p>{internshipPost.placeOfPosting || 'Multiple locations'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Positions Available</label>
                                    <p>{internshipPost.numberOfPositions || 'Multiple positions'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Compensation */}
                    {Object.values(internshipPost.remuneration || {}).some(rem => rem?.stipend) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Compensation Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(internshipPost.remuneration).map(([degree, details]) => {
                                        if (details?.stipend) {
                                            return (
                                                <div key={degree} className="p-3 border rounded-lg">
                                                    <h4 className="font-medium text-sm text-gray-600 uppercase">{degree}</h4>
                                                    <p className="text-lg font-semibold">₹{details.stipend}/month</p>
                                                    {details.ctcPPO && (
                                                        <p className="text-sm text-gray-600">
                                                            PPO CTC: ₹{details.ctcPPO} LPA
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Selection Process */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Selection Process</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Campus Visit Dates</label>
                                    <p>{formatDateArray(internshipPost.preferredDatesForCampusVisit)}</p>
                                </div>
                                
                                {internshipPost.selectionProcess && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Selection Rounds</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {internshipPost.selectionProcess.aptitudeTest && (
                                                <Badge variant="secondary">Aptitude Test</Badge>
                                            )}
                                            {internshipPost.selectionProcess.technicalTest && (
                                                <Badge variant="secondary">Technical Test</Badge>
                                            )}
                                            {internshipPost.selectionProcess.groupDiscussion && (
                                                <Badge variant="secondary">Group Discussion</Badge>
                                            )}
                                            {internshipPost.selectionProcess.personalInterview && (
                                                <Badge variant="secondary">Personal Interview</Badge>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {internshipPost.finalOfferAnnouncement && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Result Announcement</label>
                                        <p>{internshipPost.finalOfferAnnouncement}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Requirements Tab */}
                <TabsContent value="requirements" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Eligibility Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Programs */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-2">Required Programs</label>
                                <div className="flex flex-wrap gap-2">
                                    {internshipPost.requiredPrograms?.map(program => (
                                        <Badge key={program} variant="outline">{program}</Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Branches */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-2">Eligible Branches</label>
                                {internshipPost.requiredBranches?.allBranchesApplicable ? (
                                    <Badge className="bg-green-100 text-green-800">All Branches Applicable</Badge>
                                ) : (
                                    <div className="space-y-3">
                                        {Object.entries(internshipPost.requiredBranches || {}).map(([program, branches]) => {
                                            if (Array.isArray(branches) && branches.length > 0) {
                                                return (
                                                    <div key={program}>
                                                        <h4 className="font-medium text-sm text-gray-700 uppercase mb-1">{program}</h4>
                                                        <div className="flex flex-wrap gap-1">
                                                            {branches.map(branch => (
                                                                <Badge key={branch} variant="outline" className="text-xs">
                                                                    {branch}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* CGPA */}
                            {internshipPost.cgpaRequirements && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600 block mb-2">CGPA Requirements</label>
                                    <p className="p-3 bg-gray-50 rounded border">{internshipPost.cgpaRequirements}</p>
                                </div>
                            )}

                            {/* Academic Year */}
                            {internshipPost.studentPassingYearForInternship?.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600 block mb-2">Eligible Academic Years</label>
                                    <div className="flex flex-wrap gap-2">
                                        {internshipPost.studentPassingYearForInternship.map(year => (
                                            <Badge key={year} variant="outline">{year}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Other Requirements */}
                            {internshipPost.anyOtherRequirement && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600 block mb-2">Additional Requirements</label>
                                    <div className="p-4 bg-gray-50 rounded border">
                                        <p className="whitespace-pre-wrap">{internshipPost.anyOtherRequirement}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Eligibility Check Tab */}
                <TabsContent value="eligibility">
                    <InternshipRequirementsChecker 
                        internshipPost={internshipPost}
                        studentProfile={studentProfile}
                    />
                </TabsContent>

                {/* Apply Tab */}
                <TabsContent value="apply">
                    {!isEligible && !hasApplied ? (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                You cannot apply for this internship because you do not meet the mandatory eligibility requirements. 
                                Please check the "Eligibility Check" tab for more details.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <InternshipApplicationForm
                            internshipPost={internshipPost}
                            studentProfile={studentProfile}
                            eligibilityResults={eligibilityResults}
                            isEligible={isEligible}
                            hasApplied={hasApplied}
                            onApplicationSubmit={handleApplicationSubmit}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default EnhancedInternshipDetails;
