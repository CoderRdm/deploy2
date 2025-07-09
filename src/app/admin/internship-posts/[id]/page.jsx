'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ApplicationDetailsModal from '@/components/admin/ApplicationDetailsModal';

export default function InternshipPostDetailPage({ params }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { id } = params; // Get the ID from the URL

    const [internshipPost, setInternshipPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session.user.role !== 'admin') {
            router.replace('/admin-login'); // Redirect if not authenticated as admin
            return;
        }

        const fetchInternshipPost = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/admin/internship-posts/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setInternshipPost(data.data);
                } else {
                    setError(data.message || 'Failed to fetch internship post details.');
                }
            } catch (err) {
                console.error('Error fetching internship post details:', err);
                setError('An unexpected error occurred while fetching internship post details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) { // Ensure ID is available before fetching
            fetchInternshipPost();
        }
    }, [id, session, status, router]);

    if (loading) {
        return (
            <div className="p-8 max-w-4xl mx-auto my-8 bg-white rounded-xl shadow-lg font-sans leading-relaxed text-center text-lg text-gray-700">
                Loading internship post details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-4xl mx-auto my-8 bg-white rounded-xl shadow-lg font-sans leading-relaxed text-center text-lg text-red-600">
                Error: {error}
            </div>
        );
    }

    if (!internshipPost) {
        return (
            <div className="p-8 max-w-4xl mx-auto my-8 bg-white rounded-xl shadow-lg font-sans leading-relaxed text-center text-lg text-gray-700">
                Internship post not found.
            </div>
        );
    }

    // Helper to render sections only if data exists
    const renderSection = (title, dataObject) => {
        const entries = Object.entries(dataObject || {}).filter(([key, value]) => {
            // Filter out empty arrays, objects, null, undefined, and empty strings
            if (Array.isArray(value) && value.length === 0) return false;
            if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return false;
            if (value === null || value === undefined || value === '') return false;
            return true;
        });

        if (entries.length === 0) return null;

        return (
            <div className="mb-8 border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="text-blue-700 mb-4 text-2xl border-b border-dashed border-gray-300 pb-2">
                    {title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entries.map(([key, value]) => {
                        let displayValue;
                        if (key.includes('Date')) {
                            displayValue = value ? new Date(value).toLocaleDateString() : 'N/A';
                        } else if (typeof value === 'boolean') {
                            displayValue = value ? 'Yes' : 'No';
                        } else if (Array.isArray(value)) {
                            displayValue = value.length > 0 ? value.join(', ') : 'N/A';
                        } else if (typeof value === 'object' && value !== null) {
                            // Recursively render nested objects, or handle specifically
                            return (
                                <div key={key} className="bg-white p-4 rounded-md border border-gray-200 break-words">
                                    <strong>{formatLabel(key)}:</strong>
                                    {renderSection('', value)} {/* Render nested as a sub-section */}
                                </div>
                            );
                        } else {
                            displayValue = value || 'N/A';
                        }

                        // Special handling for nested remuneration and selectionProcess
                        if (key === 'remuneration') {
                            return (
                                <div key={key} className="col-span-full bg-white p-4 rounded-md border border-gray-200 break-words">
                                    <h4 className="mt-2 mb-1 text-blue-700 text-lg font-semibold">Remuneration Details</h4>
                                    {Object.entries(value).map(([program, remunerationData]) =>
                                        renderSection(`${formatLabel(program)} Remuneration`, remunerationData)
                                    )}
                                </div>
                            );
                        } else if (key === 'selectionProcess') {
                            return (
                                <div key={key} className="col-span-full bg-white p-4 rounded-md border border-gray-200 break-words">
                                    <h4 className="mt-2 mb-1 text-blue-700 text-lg font-semibold">Selection Process</h4>
                                    {Object.entries(value).map(([processKey, processValue]) => {
                                        if (typeof processValue === 'object' && processValue !== null) {
                                            return (
                                                <div key={processKey} className="bg-white p-4 rounded-md border border-gray-200 break-words">
                                                    <strong>{formatLabel(processKey)}:</strong> {processValue.required ? 'Yes' : 'No'}
                                                    {processValue.duration && `, Duration: ${processValue.duration} minutes`}
                                                    {processValue.numberOfRounds && `, Rounds: ${processValue.numberOfRounds}`}
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={processKey} className="bg-white p-4 rounded-md border border-gray-200 break-words">
                                                <strong>{formatLabel(processKey)}:</strong> {typeof processValue === 'boolean' ? (processValue ? 'Yes' : 'No') : processValue}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        } else if (key === 'requiredBranches') {
                            return (
                                <div key={key} className="col-span-full bg-white p-4 rounded-md border border-gray-200 break-words">
                                    <h4 className="mt-2 mb-1 text-blue-700 text-lg font-semibold">Required Branches</h4>
                                    {Object.entries(value).map(([branchType, branches]) => {
                                        if (Array.isArray(branches) && branches.length > 0) {
                                            return (
                                                <div key={branchType} className="bg-white p-4 rounded-md border border-gray-200 break-words">
                                                    <strong>{formatLabel(branchType)}:</strong> {branches.join(', ')}
                                                </div>
                                            );
                                        } else if (typeof branches === 'boolean' && branches) {
                                            return (
                                                <div key={branchType} className="bg-white p-4 rounded-md border border-gray-200 break-words">
                                                    <strong>All Branches Applicable:</strong> Yes
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            );
                        }


                        return (
                            <div key={key} className="bg-white p-4 rounded-md border border-gray-200 break-words">
                                <strong>{formatLabel(key)}:</strong> {displayValue}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const formatLabel = (key) => {
        return key
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
    };

    const renderAppliedStudentsSection = () => {
        if (!internshipPost.applications || internshipPost.applications.length === 0) {
            return (
                <div className="mb-8 border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <h3 className="text-blue-700 mb-4 text-2xl border-b border-dashed border-gray-300 pb-2">
                        Applied Students (0)
                    </h3>
                    <div className="text-center py-5 text-gray-600">
                        <p>No students have applied for this internship yet.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="mb-8 border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="text-blue-700 mb-4 text-2xl border-b border-dashed border-gray-300 pb-2">
                    Applied Students ({internshipPost.applications.length})
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse mt-2 bg-white rounded-lg overflow-hidden shadow-md">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 text-left font-bold text-gray-700 border-b-2 border-gray-200">Student ID</th>
                                <th className="p-3 text-left font-bold text-gray-700 border-b-2 border-gray-200">Name</th>
                                <th className="p-3 text-left font-bold text-gray-700 border-b-2 border-gray-200">Email</th>
                                <th className="p-3 text-left font-bold text-gray-700 border-b-2 border-gray-200">Applied Date</th>
                                <th className="p-3 text-left font-bold text-gray-700 border-b-2 border-gray-200">Status</th>
                                <th className="p-3 text-left font-bold text-gray-700 border-b-2 border-gray-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {internshipPost.applications.map((application, index) => (
                                <tr key={application._id || index} className="border-b border-gray-100">
                                    <td className="p-3 align-middle">{application.student?.student_id || 'Loading...'}</td>
                                    <td className="p-3 align-middle">{application.student?.name || 'Loading...'}</td>
                                    <td className="p-3 align-middle">{application.student?.email || 'Loading...'}</td>
                                    <td className="p-3 align-middle">
                                        {new Date(application.appliedDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-3 align-middle">
                                        <span className={`px-2 py-1 rounded text-white text-sm font-bold inline-block ${
                                            getStatusColorClass(application.status)
                                        }`}>
                                            {application.status}
                                        </span>
                                    </td>
                                    <td className="p-3 align-middle">
                                        <button
                                            onClick={() => viewApplicationDetails(application)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1 rounded cursor-pointer text-sm transition duration-200"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const getStatusColorClass = (status) => {
        const colors = {
            'Applied': 'bg-blue-600',
            'Reviewed': 'bg-yellow-500',
            'Interview Scheduled': 'bg-cyan-600',
            'Selected': 'bg-green-600',
            'Rejected': 'bg-red-600'
        };
        return colors[status] || 'bg-gray-600';
    };

    const viewApplicationDetails = (application) => {
        setSelectedApplication(application);
        setIsModalOpen(true);
    };

    const handleStatusUpdate = async (applicationId, newStatus) => {
        try {
            const response = await fetch('/api/admin/applications/update-status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: internshipPost._id,
                    postType: 'internship',
                    applicationId,
                    newStatus
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Update the local state
                setInternshipPost(prevPost => ({
                    ...prevPost,
                    applications: prevPost.applications.map(app => 
                        app._id === applicationId 
                            ? { ...app, status: newStatus }
                            : app
                    )
                }));
                alert('Application status updated successfully!');
            } else {
                alert('Error updating status: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            alert('Error updating application status');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedApplication(null);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto my-8 bg-white rounded-xl shadow-lg font-sans leading-relaxed">
            <button
                onClick={() => router.back()}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md border-none cursor-pointer text-base inline-block mb-5 transition duration-300 ease-in-out"
            >
                &larr; Back to Admin Dashboard
            </button>
            <h1 className="text-center text-blue-700 mb-6 text-4xl border-b-2 border-gray-200 pb-4">
                Internship Post Details
            </h1>
            <p className="text-center mb-5 text-gray-600">
                <span className="font-bold">Organization:</span> {internshipPost.organizationName} |
                <span className="font-bold"> Profile:</span> {internshipPost.internshipProfile}
            </p>
            <p className="text-center mb-5 text-gray-600">
                <span className="font-bold">Announced to Students:</span> {internshipPost.isAnnounced ? 'Yes' : 'No'}
            </p>

            {renderSection('About Organization', {
                dateSubmitted: internshipPost.dateSubmitted,
                organizationName: internshipPost.organizationName,
                website: internshipPost.website,
                organizationType: internshipPost.organizationType,
                organizationTypeOther: internshipPost.organizationTypeOther,
                industrySector: internshipPost.industrySector,
                industrySectorOther: internshipPost.industrySectorOther,
            })}

            {renderSection('Intern Profile', {
                internshipProfile: internshipPost.internshipProfile,
                tentativeDateOfJoining: internshipPost.tentativeDateOfJoining,
                internshipDuration: internshipPost.internshipDuration,
                placeOfPosting: internshipPost.placeOfPosting,
            })}

            {renderSection('Degree/Discipline Required', internshipPost.requiredBranches)}

            {renderSection('Number of Positions', {
                numberOfPositions: internshipPost.numberOfPositions,
            })}

            {renderSection('Candidate Requirements', {
                cgpaRequirements: internshipPost.cgpaRequirements,
                studentPassingYearForInternship: internshipPost.studentPassingYearForInternship,
                anyOtherRequirement: internshipPost.anyOtherRequirement,
            })}

            {renderSection('Remuneration Package Details', internshipPost.remuneration)}

            {renderSection('Selection Procedure', {
                prePlacementTalkRequired: internshipPost.prePlacementTalkRequired,
                selectionProcess: internshipPost.selectionProcess,
                finalOfferAnnouncement: internshipPost.finalOfferAnnouncement,
            })}

            {renderSection('Company Policy', {
                preferredDatesForCampusVisit: internshipPost.preferredDatesForCampusVisit,
                numberOfExecutivesVisiting: internshipPost.numberOfExecutivesVisiting,
                numberOfRoomsRequired: internshipPost.numberOfRoomsRequired,
                companyAccommodationProvided: internshipPost.companyAccommodationProvided,
                serviceAgreementRequired: internshipPost.serviceAgreementRequired,
                serviceAgreementDuration: internshipPost.serviceAgreementDuration,
                differentialPayForNITs: internshipPost.differentialPayForNITs,
            })}

            {renderSection('Contact Information', {
                contactPerson: internshipPost.contactPerson,
                emailAddress: internshipPost.emailAddress,
                contactAddress: internshipPost.contactAddress,
                mobileNo: internshipPost.mobileNo,
            })}

            {renderSection('Signature', {
                signatureName: internshipPost.signatureName,
                signatureDesignation: internshipPost.signatureDesignation,
            })}

            {/* Applied Students Section */}
            {renderAppliedStudentsSection()}

            {/* Application Details Modal */}
            <ApplicationDetailsModal 
                application={selectedApplication}
                isOpen={isModalOpen}
                onClose={closeModal}
                onStatusUpdate={handleStatusUpdate}
            />
        </div>
    );
}