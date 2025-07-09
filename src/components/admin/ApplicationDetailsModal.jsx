// src/components/admin/ApplicationDetailsModal.jsx
'use client';

import { useState } from 'react';

export default function ApplicationDetailsModal({ application, isOpen, onClose, onStatusUpdate }) {
    const [selectedStatus, setSelectedStatus] = useState(application?.status || 'Applied');
    const [isUpdating, setIsUpdating] = useState(false);

    if (!isOpen || !application) return null;

    const statusOptions = [
        'Applied',
        'Reviewed', 
        'Interview Scheduled',
        'Selected',
        'Rejected'
    ];

    const getStatusColor = (status) => {
        const colors = {
            'Applied': 'bg-blue-600',
            'Reviewed': 'bg-yellow-500',
            'Interview Scheduled': 'bg-cyan-600',
            'Selected': 'bg-green-600',
            'Rejected': 'bg-red-600'
        };
        return colors[status] || 'bg-gray-600';
    };

    const handleStatusUpdate = async () => {
        if (selectedStatus === application.status) return;
        
        setIsUpdating(true);
        try {
            // Call the parent component's status update function
            await onStatusUpdate(application._id, selectedStatus);
            onClose();
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Application Details</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Student Information */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Student Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="font-medium text-gray-600">Name:</span>
                            <p className="text-gray-800">{application.student?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-600">Student ID:</span>
                            <p className="text-gray-800">{application.student?.student_id || 'N/A'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <span className="font-medium text-gray-600">Email:</span>
                            <p className="text-gray-800">{application.student?.email || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Application Information */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Application Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <span className="font-medium text-gray-600">Applied Date:</span>
                            <p className="text-gray-800">{new Date(application.appliedDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-600">Current Status:</span>
                            <span className={`inline-block px-3 py-1 rounded text-white text-sm font-bold ml-2 ${getStatusColor(application.status)}`}>
                                {application.status}
                            </span>
                        </div>
                    </div>
                    
                    {/* Eligibility Acknowledgment */}
                    <div className="mb-4">
                        <span className="font-medium text-gray-600">Eligibility Acknowledged:</span>
                        <span className={`inline-block px-2 py-1 rounded text-white text-sm font-bold ml-2 ${
                            application.eligibilityAcknowledged ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                            {application.eligibilityAcknowledged ? 'Yes' : 'No'}
                        </span>
                    </div>

                    {/* Cover Letter */}
                    <div className="mb-4">
                        <span className="font-medium text-gray-600">Cover Letter:</span>
                        <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                            <p className="text-gray-800 whitespace-pre-wrap">{application.coverLetter || 'No cover letter provided'}</p>
                        </div>
                    </div>

                    {/* Additional Information */}
                    {application.additionalInfo && (
                        <div className="mb-4">
                            <span className="font-medium text-gray-600">Additional Information:</span>
                            <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                                <p className="text-gray-800 whitespace-pre-wrap">{application.additionalInfo}</p>
                            </div>
                        </div>
                    )}

                    {/* Resume Section */}
                    <div className="mb-4">
                        <span className="font-medium text-gray-600">Resume:</span>
                        {application.student?.resume?.fileName ? (
                            <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{application.student.resume.originalName}</p>
                                            <p className="text-xs text-gray-500">
                                                Uploaded on {new Date(application.student.resume.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => window.open(application.student.resume.url, '_blank')}
                                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = application.student.resume.url;
                                                link.download = application.student.resume.originalName;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                        >
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-2 p-3 bg-gray-100 rounded border border-gray-200">
                                <p className="text-gray-500 text-sm">No resume uploaded</p>
                            </div>
                        )}
                    </div>

                    {/* Application Metadata */}
                    {(application.submissionIp || application.browserInfo) && (
                        <div className="mt-4 text-sm text-gray-500">
                            {application.submissionIp && (
                                <p><span className="font-medium">Submission IP:</span> {application.submissionIp}</p>
                            )}
                            {application.browserInfo && (
                                <p><span className="font-medium">Browser:</span> {application.browserInfo}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Status Update Section */}
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Update Application Status</h3>
                    <div className="flex items-center gap-4">
                        <select 
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleStatusUpdate}
                            disabled={isUpdating || selectedStatus === application.status}
                            className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                                isUpdating || selectedStatus === application.status
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isUpdating ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
