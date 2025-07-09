// src/app/student/applications/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function StudentApplicationDetailsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { id } = useParams(); // Get the application ID from the URL

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session.user.role !== 'student') {
            router.replace('/login');
            return;
        }

        fetchApplication();
    }, [status, session, router]);

    const fetchApplication = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/student/applications/${id}`);
            const data = await response.json();

            if (response.ok) {
                setApplication(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch application details');
            }
        } catch (err) {
            console.error('Error fetching application details:', err);
            setError(err.message);
            toast.error('Failed to load application details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading application details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <p className="text-gray-700">{error}</p>
                    <button 
                        onClick={fetchApplication}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
                    <p className="mt-2 text-gray-600">Review your application and status</p>
                </div>

                <div className="rounded-lg shadow-md bg-white p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">{application.postTitle || 'N/A'}</h2>
                    <div className="space-y-4">
                        <div className="text-sm text-gray-600">
                            <strong>Applied On:</strong> {new Date(application.appliedDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                            <strong>Status:</strong>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(application.status)}`}>
                                {application.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg shadow-md bg-white p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Application</h3>
                    <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-2">
                            <strong>Cover Letter:</strong>
                        </div>
                        <p className="bg-gray-50 p-3 rounded-md text-sm text-gray-800 whitespace-pre-wrap">
                            {application.coverLetter || 'N/A'}
                        </p>
                    </div>

                    <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-2">
                            <strong>Additional Information:</strong>
                        </div>
                        <p className="bg-gray-50 p-3 rounded-md text-sm text-gray-800 whitespace-pre-wrap">
                            {application.additionalInfo || 'N/A'}
                        </p>
                    </div>

                    <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-2">
                            <strong>Resume:</strong>
                        </div>
                        {application.resumeUrl ? (
                            <a
                                href={application.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                View Resume
                            </a>
                        ) : (
                            <p className="text-gray-500">No resume uploaded</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    function getStatusClass(status) {
        const classes = {
            'Applied': 'bg-blue-100 text-blue-800',
            'Reviewed': 'bg-yellow-100 text-yellow-800',
            'Interview Scheduled': 'bg-purple-100 text-purple-800',
            'Selected': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }
}

