'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    ArrowLeft, 
    Building2, 
    MapPin, 
    Calendar, 
    DollarSign, 
    Users, 
    GraduationCap,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ExternalLink
} from 'lucide-react';

import RequirementsChecker from './RequirementsChecker';
import ApplicationForm from './ApplicationForm';

const EnhancedJobDetails = ({ jobId }) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [jobPost, setJobPost] = useState(null);
    const [studentProfile, setStudentProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasApplied, setHasApplied] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEligible, setIsEligible] = useState(false);
    const [eligibilityResults, setEligibilityResults] = useState([]);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session.user.role !== 'student') {
            router.replace('/login');
            return;
        }

        fetchJobDetails();
        fetchStudentProfile();
    }, [jobId, session, status, router]);

    const fetchJobDetails = async () => {
        try {
            const res = await fetch(`/api/student/announcements/jobs/${jobId}`);
            const data = await res.json();

            if (res.ok) {
                setJobPost(data.data);
                setHasApplied(data.data.hasApplied);
            } else {
                setError(data.message || 'Failed to fetch job details.');
            }
        } catch (err) {
            console.error('Error fetching job details:', err);
            setError('An unexpected error occurred while fetching job details.');
        }
    };

    const fetchStudentProfile = async () => {
        try {
            const res = await fetch('/api/student/profile');
            const data = await res.json();

            if (res.ok) {
                setStudentProfile(data.data);
            } else {
                console.error('Failed to fetch student profile:', data.message);
            }
        } catch (err) {
            console.error('Error fetching student profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEligibilityChange = (eligible, results) => {
        setIsEligible(eligible);
        setEligibilityResults(results);
    };

    const handleApplicationSubmit = (success) => {
        if (success) {
            setHasApplied(true);
            setActiveTab('application');
        }
    };

    const renderDetailItem = (label, value, icon = null) => {
        let displayValue = value;
        if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
            displayValue = 'N/A';
        } else if (typeof value === 'boolean') {
            displayValue = value ? 'Yes' : 'No';
        } else if (value instanceof Date || (typeof value === 'string' && !isNaN(new Date(value)))) {
            const dateObj = new Date(value);
            displayValue = dateObj.toLocaleDateString();
        } else if (Array.isArray(value)) {
            displayValue = value.length > 0 ? value.join(', ') : 'N/A';
        }

        return (
            <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                {icon && <div className="mt-0.5">{icon}</div>}
                <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">{label}</div>
                    <div className="text-gray-700 text-sm">{displayValue}</div>
                </div>
            </div>
        );
    };

    const getJobTypeColor = (organizationType) => {
        const colors = {
            'MNC (Foreign)': 'bg-blue-100 text-blue-800',
            'MNC (Indian)': 'bg-blue-100 text-blue-800',
            'Private sector': 'bg-green-100 text-green-800',
            'Start-up': 'bg-purple-100 text-purple-800',
            'Govt. owned': 'bg-orange-100 text-orange-800',
            'Public sector': 'bg-orange-100 text-orange-800'
        };
        return colors[organizationType] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-red-600">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                            <p className="text-lg font-medium">Error</p>
                            <p className="text-sm mt-2">{error}</p>
                            <Button onClick={() => router.back()} className="mt-4">
                                Go Back
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!jobPost) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-lg">Job post not found or you don't have access to view it.</p>
                            <Button onClick={() => router.back()} className="mt-4">
                                Go Back
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <Button 
                        variant="ghost" 
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Jobs
                    </Button>
                    
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-4 items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className={getJobTypeColor(jobPost.organizationType)}>
                                            {jobPost.organizationType}
                                        </Badge>
                                        {hasApplied && (
                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Applied
                                            </Badge>
                                        )}
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                        {jobPost.jobDesignation}
                                    </h1>
                                    <div className="flex items-center gap-4 text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Building2 className="h-4 w-4" />
                                            <span>{jobPost.organizationName}</span>
                                        </div>
                                        {jobPost.placeOfPosting && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{jobPost.placeOfPosting}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>Posted {new Date(jobPost.dateSubmitted).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    {jobPost.website && (
                                        <div className="mt-2">
                                            <a 
                                                href={jobPost.website} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                Visit Company Website
                                            </a>
                                        </div>
                                    )}
                                </div>
                            
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="requirements">Requirements</TabsTrigger>
                        <TabsTrigger value="eligibility">Eligibility Check</TabsTrigger>
                        <TabsTrigger value="application">
                            {hasApplied ? 'Application Status' : 'Apply Now'}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Job Description */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Job Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {jobPost.jobDescription || 'No description provided.'}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Key Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Key Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {renderDetailItem(
                                        'Industry Sector',
                                        jobPost.industrySector,
                                        <Building2 className="h-4 w-4 text-gray-500" />
                                    )}
                                    {jobPost.tentativeDateOfJoining && renderDetailItem(
                                        'Tentative Joining Date',
                                        jobPost.tentativeDateOfJoining,
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                    )}
                                    {jobPost.ctc && renderDetailItem(
                                        'CTC Package',
                                        jobPost.ctc,
                                        <DollarSign className="h-4 w-4 text-gray-500" />
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Remuneration Details */}
                        {jobPost.ctc && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Compensation & Benefits</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {renderDetailItem('CTC Package', jobPost.ctc)}
                                        {renderDetailItem('Company Accommodation', jobPost.companyAccommodationProvided)}
                                        {renderDetailItem('Service Agreement Required', jobPost.serviceAgreementRequired)}
                                        {jobPost.serviceAgreementRequired && renderDetailItem(
                                            'Service Agreement Duration (Years)', 
                                            jobPost.serviceAgreementDuration
                                        )}
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
                                <div className="grid gap-4 md:grid-cols-2">
                                    {jobPost.selectionProcess?.aptitudeTest && 
                                        renderDetailItem('Aptitude Test', 'Yes')}
                                    {jobPost.selectionProcess?.technicalTest && 
                                        renderDetailItem('Technical Test', 'Yes')}
                                    {jobPost.selectionProcess?.groupDiscussion && 
                                        renderDetailItem('Group Discussion', 'Yes')}
                                    {jobPost.selectionProcess?.personalInterview && 
                                        renderDetailItem('Personal Interview', 'Yes')}
                                    {jobPost.selectionProcess?.numberOfRounds && 
                                        renderDetailItem('Number of Interview Rounds', jobPost.selectionProcess.numberOfRounds)}
                                    {renderDetailItem('Final Offer Announcement', jobPost.finalOfferAnnouncement)}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="requirements" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Eligibility Criteria</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {renderDetailItem(
                                        'Required Programs',
                                        jobPost.requiredPrograms,
                                        <GraduationCap className="h-4 w-4 text-gray-500" />
                                    )}
                                    
                                    {jobPost.requiredBranches?.allBranchesApplicable ? (
                                        renderDetailItem('Eligible Branches', 'All Branches Applicable')
                                    ) : (
                                        <>
                                            {jobPost.requiredBranches?.btech?.length > 0 && 
                                                renderDetailItem('B.Tech Branches', jobPost.requiredBranches.btech)}
                                            {jobPost.requiredBranches?.mtech?.length > 0 && 
                                                renderDetailItem('M.Tech Branches', jobPost.requiredBranches.mtech)}
                                            {jobPost.requiredBranches?.msc?.length > 0 && 
                                                renderDetailItem('M.Sc Branches', jobPost.requiredBranches.msc)}
                                            {jobPost.requiredBranches?.mba?.length > 0 && 
                                                renderDetailItem('MBA Branches', jobPost.requiredBranches.mba)}
                                        </>
                                    )}
                                    
                                    {jobPost.cgpaRequirements && 
                                        renderDetailItem('CGPA Requirements', jobPost.cgpaRequirements)}
                                    {jobPost.medicalRequirements && 
                                        renderDetailItem('Medical Requirements', jobPost.medicalRequirements)}
                                    {jobPost.anyOtherRequirement && 
                                        renderDetailItem('Other Requirements', jobPost.anyOtherRequirement)}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="eligibility" className="space-y-6">
                        {studentProfile ? (
                            <RequirementsChecker 
                                jobPost={jobPost}
                                studentProfile={studentProfile}
                                onEligibilityChange={handleEligibilityChange}
                            />
                        ) : (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                                        <p className="text-lg font-medium">Unable to check eligibility</p>
                                        <p className="text-sm text-gray-600 mt-2">
                                            We couldn't load your profile. Please ensure your profile is complete.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="application" className="space-y-6">
                        {studentProfile ? (
                            <ApplicationForm
                                jobPost={jobPost}
                                studentProfile={studentProfile}
                                eligibilityResults={eligibilityResults}
                                isEligible={isEligible}
                                hasApplied={hasApplied}
                                onApplicationSubmit={handleApplicationSubmit}
                            />
                        ) : (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                                        <p className="text-lg font-medium">Profile Required</p>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Please complete your profile before applying for jobs.
                                        </p>
                                        <Button 
                                            onClick={() => router.push('/complete-profile')} 
                                            className="mt-4"
                                        >
                                            Complete Profile
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default EnhancedJobDetails;
