// src/components/ApplicationsSection.jsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ApplicationsSection() {
    const { data: session } = useSession();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

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

    const getFilteredApplications = () => {
        switch (activeTab) {
            case 'pending':
                return pendingApplications;
            case 'selected':
                return selectedApplications;
            case 'rejected':
                return rejectedApplications;
            default:
                return allApplications;
        }
    };

    const filteredApplications = getFilteredApplications();''

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header with Statistics */}
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Applications</h3>
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

                {/* Filter Tabs */}
                <div className="flex space-x-1">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                            activeTab === 'all'
                                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        All ({allApplications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                            activeTab === 'pending'
                                ? 'bg-yellow-50 text-yellow-700 border-b-2 border-yellow-700'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Pending ({pendingApplications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('selected')}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                            activeTab === 'selected'
                                ? 'bg-green-50 text-green-700 border-b-2 border-green-700'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Selected ({selectedApplications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('rejected')}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                            activeTab === 'rejected'
                                ? 'bg-red-50 text-red-700 border-b-2 border-red-700'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Rejected ({rejectedApplications.length})
                    </button>
                </div>
            </div>

            {/* Applications List */}
            <div className="p-6">
                {filteredApplications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-lg">
                            {activeTab === 'all' 
                                ? 'No applications yet' 
                                : `No ${activeTab} applications`}
                        </p>
                        <p className="text-sm">
                            {activeTab === 'all' 
                                ? 'Start applying to job and internship opportunities!' 
                                : 'Applications may appear here as you apply to opportunities.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredApplications
                            .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
                            .map((application, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
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
                )}
            </div>

            {/* Final Placement Section */}
            {finalJob && (
                <div className="p-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Final Placement</h4>
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
                            <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-medium">
                                {finalJob.currentStatus}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
