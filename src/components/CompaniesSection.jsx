// src/components/CompaniesSection.jsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function CompaniesSection() {
    const { data: session } = useSession();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('applications');

    useEffect(() => {
        if (session?.user?.id) {
            fetchStudentData();
        }
    }, [session]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/student/profile');
            const data = await response.json();
            
            if (response.ok) {
                setStudentData(data.data);
            } else {
                toast.error('Failed to fetch student data');
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            toast.error('Error loading student data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Applied': 'bg-blue-100 text-blue-800',
            'Reviewed': 'bg-yellow-100 text-yellow-800',
            'Interview Scheduled': 'bg-purple-100 text-purple-800',
            'Selected': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800',
            'Withdrawn': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    const jobApplications = studentData?.companyApplications?.jobs || [];
    const internshipApplications = studentData?.companyApplications?.internships || [];
    const finalJob = studentData?.placements?.finalJob;
    const completedInternships = studentData?.placements?.internshipsCompleted || [];

    const allApplications = [...jobApplications, ...internshipApplications];
    const selectedApplications = allApplications.filter(app => app.currentStatus === 'Selected');
    const rejectedApplications = allApplications.filter(app => app.currentStatus === 'Rejected');
    const pendingApplications = allApplications.filter(app => 
        !['Selected', 'Rejected'].includes(app.currentStatus)
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header with Tabs */}
            <div className="border-b border-gray-200">
                <div className="p-6 pb-0">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Companies</h3>
                    <div className="flex space-x-1">
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                                activeTab === 'applications'
                                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Applications ({allApplications.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('placements')}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                                activeTab === 'placements'
                                    ? 'bg-green-50 text-green-700 border-b-2 border-green-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Placements ({finalJob ? 1 : 0} + {completedInternships.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === 'applications' && (
                    <div className="space-y-6">
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{allApplications.length}</div>
                                <div className="text-sm text-blue-800">Total Applied</div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">{pendingApplications.length}</div>
                                <div className="text-sm text-yellow-800">Pending</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{selectedApplications.length}</div>
                                <div className="text-sm text-green-800">Selected</div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{rejectedApplications.length}</div>
                                <div className="text-sm text-red-800">Rejected</div>
                            </div>
                        </div>

                        {/* Applications List */}
                        {allApplications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-6xl mb-4">📝</div>
                                <p className="text-lg">No applications yet</p>
                                <p className="text-sm">Start applying to job and internship opportunities!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Recent Applications</h4>
                                <div className="space-y-3">
                                    {allApplications
                                        .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
                                        .slice(0, 10)
                                        .map((application, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900">{application.companyName}</h5>
                                                    <p className="text-sm text-gray-600">{application.position}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Applied on {formatDate(application.appliedDate)}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end space-y-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.currentStatus)}`}>
                                                        {application.currentStatus}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        jobApplications.includes(application) ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                        {jobApplications.includes(application) ? 'Job' : 'Internship'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Status History */}
                                            {application.statusHistory && application.statusHistory.length > 1 && (
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <p className="text-xs text-gray-500 mb-2">Status History:</p>
                                                    <div className="space-y-1">
                                                        {application.statusHistory.slice(-3).map((history, hIndex) => (
                                                            <div key={hIndex} className="text-xs text-gray-600 flex justify-between">
                                                                <span>{history.status}</span>
                                                                <span>{formatDate(history.updatedDate)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'placements' && (
                    <div className="space-y-6">
                        {/* Final Job Placement */}
                        {finalJob && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Final Placement</h4>
                                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h5 className="font-medium text-green-900">{finalJob.companyName}</h5>
                                            <p className="text-sm text-green-700">{finalJob.position}</p>
                                            {finalJob.ctc && (
                                                <p className="text-sm text-green-600">CTC: ₹{finalJob.ctc.toLocaleString()}</p>
                                            )}
                                            {finalJob.workLocation && (
                                                <p className="text-xs text-green-600">Location: {finalJob.workLocation}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-medium">
                                                {finalJob.offerType || 'Placed'}
                                            </span>
                                            {finalJob.joiningDate && (
                                                <p className="text-xs text-green-600 mt-1">
                                                    Joining: {formatDate(finalJob.joiningDate)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Completed Internships */}
                        {completedInternships.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Completed Internships</h4>
                                <div className="space-y-3">
                                    {completedInternships.map((internship, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-medium text-gray-900">{internship.companyName}</h5>
                                                    <p className="text-sm text-gray-600">{internship.position}</p>
                                                    {internship.duration && (
                                                        <p className="text-xs text-gray-500">Duration: {internship.duration}</p>
                                                    )}
                                                    {internship.stipend && (
                                                        <p className="text-xs text-gray-500">Stipend: ₹{internship.stipend.toLocaleString()}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        internship.completionStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                                                        internship.completionStatus === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {internship.completionStatus}
                                                    </span>
                                                    {internship.ppoReceived && (
                                                        <div className="mt-1">
                                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                                                PPO Received
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Placements Message */}
                        {!finalJob && completedInternships.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-6xl mb-4">🎯</div>
                                <p className="text-lg">No placements yet</p>
                                <p className="text-sm">Keep applying and your placements will appear here!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
