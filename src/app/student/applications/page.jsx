// src/app/student/applications/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function StudentApplicationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [applications, setApplications] = useState({
        jobs: [],
        internships: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('jobs');

    useEffect(() => {
        if (status === 'loading') return;
        
        if (status === 'unauthenticated' || session?.user?.role !== 'student') {
            router.replace('/login');
            return;
        }

        fetchApplications();
    }, [status, session, router]);

    const fetchApplications = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const [jobsRes, internshipsRes] = await Promise.all([
                fetch('/api/student/applications/jobs'),
                fetch('/api/student/applications/internships')
            ]);

            const jobsData = await jobsRes.json();
            const internshipsData = await internshipsRes.json();

            if (jobsRes.ok && internshipsRes.ok) {
                setApplications({
                    jobs: jobsData.data || [],
                    internships: internshipsData.data || []
                });
            } else {
                throw new Error('Failed to fetch applications');
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Failed to load your applications. Please try again.');
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'Applied': 'bg-blue-100 text-blue-800',
            'Reviewed': 'bg-yellow-100 text-yellow-800',
            'Interview Scheduled': 'bg-purple-100 text-purple-800',
            'Selected': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    const ApplicationCard = ({ application, type }) => (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {type === 'jobs' ? application.post.jobDesignation : application.post.internshipProfile}
                    </h3>
                    <p className="text-gray-600">{application.post.organizationName}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {application.status}
                </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">Applied on:</span> {new Date(application.appliedDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Location:</span> {application.post.placeOfPosting || 'N/A'}</p>
                {type === 'jobs' && (
                    <p><span className="font-medium">CTC:</span> {application.post.remuneration?.btech?.ctc || application.post.remuneration?.mtech?.ctc || 'N/A'} LPA</p>
                )}
                {type === 'internships' && (
                    <>
                        <p><span className="font-medium">Duration:</span> {application.post.internshipDuration || 'N/A'}</p>
                        <p><span className="font-medium">Stipend:</span> {application.post.remuneration?.btech?.stipend || application.post.remuneration?.mtech?.stipend || 'N/A'}</p>
                    </>
                )}
            </div>
            
            <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                    <Link 
                        href={`/student/announcements/${type}/${application.post._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        View Job Details →
                    </Link>
                    <Link 
                        href={`/student/applications/${application._id}`}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                        View My Application →
                    </Link>
                </div>
                {application.status === 'Interview Scheduled' && (
                    <div className="text-sm text-purple-600 font-medium">
                        🎯 Interview Scheduled
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your applications...</p>
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
                        onClick={fetchApplications}
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                            <p className="mt-2 text-gray-600">Track your job and internship applications</p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('jobs')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'jobs'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Job Applications ({applications.jobs.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('internships')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'internships'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Internship Applications ({applications.internships.length})
                        </button>
                    </nav>
                </div>

                {/* Applications Grid */}
                <div className="mb-8">
                    {activeTab === 'jobs' && (
                        <div>
                            {applications.jobs.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 text-6xl mb-4">📄</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No job applications yet</h3>
                                    <p className="text-gray-600 mb-6">Start applying to job opportunities to see them here.</p>
                                    <Link
                                        href="/student/announcements"
                                        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200"
                                    >
                                        Browse Job Opportunities
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {applications.jobs.map((application) => (
                                        <ApplicationCard
                                            key={application._id}
                                            application={application}
                                            type="jobs"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'internships' && (
                        <div>
                            {applications.internships.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No internship applications yet</h3>
                                    <p className="text-gray-600 mb-6">Start applying to internship opportunities to see them here.</p>
                                    <Link
                                        href="/student/announcements"
                                        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200"
                                    >
                                        Browse Internship Opportunities
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {applications.internships.map((application) => (
                                        <ApplicationCard
                                            key={application._id}
                                            application={application}
                                            type="internships"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {['Applied', 'Reviewed', 'Interview Scheduled', 'Selected', 'Rejected'].map((status) => {
                            const totalCount = [...applications.jobs, ...applications.internships]
                                .filter(app => app.status === status).length;
                            return (
                                <div key={status} className="text-center">
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getStatusColor(status)}`}>
                                        {totalCount}
                                    </div>
                                    <p className="text-xs text-gray-600">{status}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
