'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, CheckCircle, AlertCircle, Info } from 'lucide-react';
import ResumeUploader from '../student/ResumeUploader';
import toast from 'react-hot-toast';

const ApplicationForm = ({ 
    jobPost, 
    studentProfile, 
    eligibilityResults, 
    isEligible, 
    hasApplied, 
    onApplicationSubmit 
}) => {
    const [formData, setFormData] = useState({
        coverLetter: '',
        additionalInfo: ''
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        // Pre-fill some information if available
        if (studentProfile) {
            setFormData(prev => ({
                ...prev,
                // Add any pre-filled data here
            }));
        }
    }, [studentProfile]);

    const validateForm = () => {
        // No validation required - allow application with minimal info
        setFormErrors({});
        return true;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the form errors before submitting');
            return;
        }

        // Allow all applications regardless of eligibility

        setShowConfirmation(true);
    };

    const confirmSubmission = async () => {
        setIsSubmitting(true);
        setShowConfirmation(false);

        try {
            const applicationData = {
                postId: jobPost._id,
                coverLetter: formData.coverLetter,
                additionalInfo: formData.additionalInfo,
                eligibilityAcknowledged: true,
                applicationDate: new Date().toISOString()
            };

            const response = await fetch('/api/student/apply/job', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(applicationData)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(result.message || 'Application submitted successfully!');
                onApplicationSubmit && onApplicationSubmit(true);
            } else {
                toast.error(result.message || 'Failed to submit application');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            toast.error('An unexpected error occurred while submitting your application');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getApplicationProgress = () => {
        let progress = 0;
        let steps = 0;
        
        if (formData.coverLetter.trim()) {
            progress += 40;
        }
        steps += 40;

        // Simple progress calculation based on cover letter only
        if (formData.additionalInfo.trim()) {
            progress += 60;
        }
        steps += 60;

        return (progress / steps) * 100;
    };

    if (hasApplied) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        Application Submitted
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            Your application for <strong>{jobPost.jobDesignation}</strong> at{' '}
                            <strong>{jobPost.organizationName}</strong> has been successfully submitted.
                            You will be notified of any updates regarding your application status.
                        </AlertDescription>
                    </Alert>
                    
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Next Steps:</h4>
                        <ul className="text-sm space-y-1 text-gray-600">
                            <li>• Monitor your email for communication from the company</li>
                            <li>• Check the placement portal regularly for updates</li>
                            <li>• Prepare for potential interviews or assessments</li>
                            <li>• Contact the placement office if you have questions</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Allow all students to apply - eligibility is shown for information only

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Job Application Form</CardTitle>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Application Progress</span>
                            <span>{Math.round(getApplicationProgress())}%</span>
                        </div>
                        <Progress value={getApplicationProgress()} className="h-2" />
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Application Summary */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-medium text-blue-900 mb-2">Application Summary</h3>
                            <div className="text-sm text-blue-800 space-y-1">
                                <p><strong>Position:</strong> {jobPost.jobDesignation}</p>
                                <p><strong>Company:</strong> {jobPost.organizationName}</p>
                                <p><strong>Your Profile:</strong> {studentProfile?.name} ({studentProfile?.student_id})</p>
                                <p><strong>Branch:</strong> {studentProfile?.branch} - Year {studentProfile?.year}</p>
                                <p><strong>CGPA:</strong> {studentProfile?.cgpa?.overall || 'Not updated'}</p>
                            </div>
                        </div>

                        {/* Eligibility Status Alert - informational only */}
                        <Alert className={`${isEligible ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                            {isEligible ? <CheckCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                            <AlertDescription>
                                {isEligible ? (
                                    <><strong>Eligibility Status:</strong> You meet all the basic requirements for this position.</>
                                ) : (
                                    <><strong>Eligibility Note:</strong> Some requirements may not be met. You can still apply, but review the eligibility tab for details.</>
                                )}
                            </AlertDescription>
                        </Alert>

                        {/* Cover Letter / Statement of Interest */}
                        <div className="space-y-2">
                            <Label htmlFor="coverLetter" className="text-base font-medium">
                                Why are you interested in this position? *
                            </Label>
                            <Textarea
                                id="coverLetter"
                                placeholder="Please explain your interest in this role, relevant skills, experiences, and what you can contribute to the organization. Be specific about why you want to work for this company and how you align with their requirements."
                                value={formData.coverLetter}
                                onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                                className={`min-h-[120px] ${formErrors.coverLetter ? 'border-red-500' : ''}`}
                                rows={6}
                            />
                            {formErrors.coverLetter && (
                                <p className="text-sm text-red-600">{formErrors.coverLetter}</p>
                            )}
                            <p className="text-sm text-gray-500">
                                Characters: {formData.coverLetter.length} (minimum 50 recommended)
                            </p>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-2">
                            <Label htmlFor="additionalInfo" className="text-base font-medium">
                                Additional Information (Optional)
                            </Label>
                            <Textarea
                                id="additionalInfo"
                                placeholder="Any additional information you'd like to share (projects, achievements, certifications, extracurricular activities, etc.)"
                                value={formData.additionalInfo}
                                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                                className="min-h-[80px]"
                                rows={4}
                            />
                            <p className="text-sm text-gray-500">
                                Use this space to highlight anything not covered in your profile that might be relevant to this position.
                            </p>
                        </div>

                        {/* Document Upload Section */}
                        <div className="space-y-4">
                            <Label className="text-base font-medium">Documents</Label>
                            <Alert className="border-blue-200 bg-blue-50">
                                <FileText className="h-4 w-4" />
                                <AlertDescription>
                                    Your current profile information will be automatically included with this application. 
                                    You can also upload your latest resume below for this specific application.
                                </AlertDescription>
                            </Alert>
                            
                            <ResumeUploader 
                                currentResume={formData.resume}
                                onResumeUpdate={(resume) => handleInputChange('resume', resume)}
                            />
                        </div>

                        {/* Simple application note */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                                <strong>Note:</strong> By submitting this application, you confirm that the information provided is accurate to the best of your knowledge.
                            </p>
                        </div>

                        {/* Form Errors Summary */}
                        {Object.keys(formErrors).length > 0 && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Please fix the following errors:</strong>
                                    <ul className="mt-2 list-disc list-inside">
                                        {Object.entries(formErrors).map(([field, error]) => (
                                            <li key={field}>{error}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting || hasApplied}
                                className="flex-1"
                                size="lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Application'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>Confirm Application Submission</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">
                                Are you sure you want to submit your application for{' '}
                                <strong>{jobPost.jobDesignation}</strong> at{' '}
                                <strong>{jobPost.organizationName}</strong>?
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                Once submitted, you cannot modify your application.
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setShowConfirmation(false)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={confirmSubmission}
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ApplicationForm;
