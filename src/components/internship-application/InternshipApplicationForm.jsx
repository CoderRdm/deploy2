'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, FileText, Upload } from 'lucide-react';
import ResumeUploader from '../student/ResumeUploader';
import InternshipRequirementsChecker from './InternshipRequirementsChecker';
import toast from 'react-hot-toast';

const InternshipApplicationForm = ({ 
    internshipPost, 
    studentProfile, 
    hasApplied, 
    onApplicationSubmit 
}) => {
    const [formData, setFormData] = useState({
        coverLetter: '',
        additionalInfo: '',
        resume: null
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isEligible, setIsEligible] = useState(false);
    const [eligibilityResults, setEligibilityResults] = useState([]);
    
    const handleEligibilityChange = (eligible, results) => {
        setIsEligible(eligible);
        setEligibilityResults(results);
    };

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
        const errors = {};

        console.log('Validating form with data:', formData);

        // No validation required - allow application with minimal info

        console.log('Validation errors:', errors);
        setFormErrors(errors);
        const isValid = Object.keys(errors).length === 0;
        console.log('Form is valid:', isValid);
        return isValid;
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
                postId: internshipPost._id,
                coverLetter: formData.coverLetter,
                additionalInfo: formData.additionalInfo,
                eligibilityAcknowledged: true,
                applicationDate: new Date().toISOString()
            };

            const response = await fetch('/api/student/apply/internship', {
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

        if (formData.acknowledgeRequirements) {
            progress += 30;
        }
        steps += 30;

        if (formData.agreedToTerms) {
            progress += 30;
        }
        steps += 30;

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
                            Your application for <strong>{internshipPost.internshipProfile}</strong> at{' '}
                            <strong>{internshipPost.organizationName}</strong> has been successfully submitted.
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

    // NO ELIGIBILITY CHECKING - ALL STUDENTS CAN APPLY

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Internship Application Form</CardTitle>
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
                                <p><strong>Internship:</strong> {internshipPost.internshipProfile}</p>
                                <p><strong>Company:</strong> {internshipPost.organizationName}</p>
                                <p><strong>Duration:</strong> {internshipPost.internshipDuration || 'As specified by company'}</p>
                                <p><strong>Your Profile:</strong> {studentProfile?.name} ({studentProfile?.student_id})</p>
                                <p><strong>Branch:</strong> {studentProfile?.branch} - Year {studentProfile?.year}</p>
                                <p><strong>CGPA:</strong> {studentProfile?.cgpa?.overall || 'Not updated'}</p>
                            </div>
                        </div>

                        {/* Eligibility Check Results */}
                        <InternshipRequirementsChecker 
                            internshipPost={internshipPost} 
                            studentProfile={studentProfile}
                            onEligibilityChange={handleEligibilityChange}
                        />

                        {/* Cover Letter / Statement of Interest */}
                        <div className="space-y-2">
                            <Label htmlFor="coverLetter" className="text-base font-medium">
                                Why are you interested in this internship? *
                            </Label>
                            <Textarea
                                id="coverLetter"
                                placeholder="Please explain your interest in this internship, relevant skills, experiences, and what you hope to learn. Be specific about why you want to intern with this company and how this aligns with your career goals."
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
                                placeholder="Any additional information you'd like to share (projects, achievements, certifications, extracurricular activities, relevant coursework, etc.)"
                                value={formData.additionalInfo}
                                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                                className="min-h-[80px]"
                                rows={4}
                            />
                            <p className="text-sm text-gray-500">
                                Use this space to highlight anything not covered in your profile that might be relevant to this internship.
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

                        {/* Requirements Acknowledgment */}
                        <div className="space-y-4">
                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="acknowledgeRequirements"
                                    checked={formData.acknowledgeRequirements}
                                    onCheckedChange={(checked) => 
                                        handleInputChange('acknowledgeRequirements', checked)
                                    }
                                    className={formErrors.acknowledgeRequirements ? 'border-red-500' : ''}
                                />
                                <Label htmlFor="acknowledgeRequirements" className="text-sm leading-5">
                                    I acknowledge that I have read and understood the eligibility requirements 
                                    for this internship. I confirm that the information provided in my application 
                                    is accurate and complete.
                                </Label>
                            </div>
                            {formErrors.acknowledgeRequirements && (
                                <p className="text-sm text-red-600 ml-6">{formErrors.acknowledgeRequirements}</p>
                            )}
                        </div>

                        {/* Terms Agreement */}
                        <div className="space-y-4">
                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="agreedToTerms"
                                    checked={formData.agreedToTerms}
                                    onCheckedChange={(checked) => 
                                        handleInputChange('agreedToTerms', checked)
                                    }
                                    className={formErrors.agreedToTerms ? 'border-red-500' : ''}
                                />
                                <Label htmlFor="agreedToTerms" className="text-sm leading-5">
                                    I agree to the terms and conditions of the internship placement process. I understand 
                                    that if selected, I will be bound by the company's internship terms and 
                                    the college's placement policies.
                                </Label>
                            </div>
                            {formErrors.agreedToTerms && (
                                <p className="text-sm text-red-600 ml-6">{formErrors.agreedToTerms}</p>
                            )}
                        </div>

                        {/* Debug Info - Remove this after fixing */}
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-xs font-mono">
                            <strong>Debug Info:</strong>
                            <pre>{JSON.stringify({
                                coverLetterLength: formData.coverLetter.length,
                                acknowledgeRequirements: formData.acknowledgeRequirements,
                                agreedToTerms: formData.agreedToTerms,
                                formErrors: formErrors
                            }, null, 2)}</pre>
                        </div>

                        {/* Eligibility Warning */}
                        {!isEligible && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Application Blocked:</strong> You do not meet the mandatory eligibility requirements for this internship. 
                                    Please review the eligibility requirements above and update your profile if necessary.
                                </AlertDescription>
                            </Alert>
                        )}

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
                                ) : !isEligible ? (
                                    'Not Eligible - Cannot Apply'
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
                                <strong>{internshipPost.internshipProfile}</strong> at{' '}
                                <strong>{internshipPost.organizationName}</strong>?
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

export default InternshipApplicationForm;
