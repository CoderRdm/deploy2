// src/app/admin/job-posts/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ApplicationDetailsModal from '@/components/admin/ApplicationDetailsModal';

export default function JobPostDetailPage({ params }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { id } = params; // Get the ID from the URL

    const [jobPost, setJobPost] = useState(null);
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

        const fetchJobPost = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/admin/job-posts/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setJobPost(data.data);
                } else {
                    setError(data.message || 'Failed to fetch job post details.');
                }
            } catch (err) {
                console.error('Error fetching job post details:', err);
                setError('An unexpected error occurred while fetching job post details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) { // Ensure ID is available before fetching
            fetchJobPost();
        }
    }, [id, session, status, router]);

    if (loading) {
        return <div style={containerStyle}>Loading job post details...</div>;
    }

    if (error) {
        return <div style={{ ...containerStyle, color: 'red' }}>Error: {error}</div>;
    }

    if (!jobPost) {
        return <div style={containerStyle}>Job post not found.</div>;
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
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>{title}</h3>
                <div style={gridContainerStyle}>
                    {entries.map(([key, value]) => {
                        let displayValue;
                        if (key.includes('Date') || key === 'dob') {
                            displayValue = value ? new Date(value).toLocaleDateString() : 'N/A';
                        } else if (typeof value === 'boolean') {
                            displayValue = value ? 'Yes' : 'No';
                        } else if (Array.isArray(value)) {
                            displayValue = value.length > 0 ? value.join(', ') : 'N/A';
                        } else if (typeof value === 'object' && value !== null) {
                            // Recursively render nested objects, or handle specifically
                            return (
                                <div key={key} style={detailItemStyle}>
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
                                <div key={key} style={fullWidthDetailItemStyle}>
                                    <h4 style={{ margin: '10px 0 5px 0', color: '#0056b3' }}>Remuneration Details</h4>
                                    {Object.entries(value).map(([program, remunerationData]) =>
                                        renderSection(`${formatLabel(program)} Remuneration`, remunerationData)
                                    )}
                                </div>
                            );
                        } else if (key === 'selectionProcess') {
                             return (
                                <div key={key} style={fullWidthDetailItemStyle}>
                                    <h4 style={{ margin: '10px 0 5px 0', color: '#0056b3' }}>Selection Process</h4>
                                    {Object.entries(value).map(([processKey, processValue]) => {
                                        if (typeof processValue === 'object' && processValue !== null) {
                                            return (
                                                <div key={processKey} style={detailItemStyle}>
                                                    <strong>{formatLabel(processKey)}:</strong> {processValue.required ? 'Yes' : 'No'}
                                                    {processValue.duration && `, Duration: ${processValue.duration} minutes`}
                                                    {processValue.numberOfRounds && `, Rounds: ${processValue.numberOfRounds}`}
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={processKey} style={detailItemStyle}>
                                                <strong>{formatLabel(processKey)}:</strong> {typeof processValue === 'boolean' ? (processValue ? 'Yes' : 'No') : processValue}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        } else if (key === 'requiredBranches') {
                            return (
                                <div key={key} style={fullWidthDetailItemStyle}>
                                    <h4 style={{ margin: '10px 0 5px 0', color: '#0056b3' }}>Required Branches</h4>
                                    {Object.entries(value).map(([branchType, branches]) => {
                                        if (Array.isArray(branches) && branches.length > 0) {
                                            return (
                                                <div key={branchType} style={detailItemStyle}>
                                                    <strong>{formatLabel(branchType)}:</strong> {branches.join(', ')}
                                                </div>
                                            );
                                        } else if (typeof branches === 'boolean' && branches) {
                                             return (
                                                <div key={branchType} style={detailItemStyle}>
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
                            <div key={key} style={detailItemStyle}>
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
        if (!jobPost.applications || jobPost.applications.length === 0) {
            return (
                <div style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>Applied Students (0)</h3>
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        <p>No students have applied for this job yet.</p>
                    </div>
                </div>
            );
        }

        return (
            <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>Applied Students ({jobPost.applications.length})</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={tableHeaderStyle}>Student ID</th>
                                <th style={tableHeaderStyle}>Name</th>
                                <th style={tableHeaderStyle}>Email</th>
                                <th style={tableHeaderStyle}>Applied Date</th>
                                <th style={tableHeaderStyle}>Status</th>
                                <th style={tableHeaderStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobPost.applications.map((application, index) => (
                                <tr key={application._id || index} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={tableCellStyle}>{application.student?.student_id || 'Loading...'}</td>
                                    <td style={tableCellStyle}>{application.student?.name || 'Loading...'}</td>
                                    <td style={tableCellStyle}>{application.student?.email || 'Loading...'}</td>
                                    <td style={tableCellStyle}>
                                        {new Date(application.appliedDate).toLocaleDateString()}
                                    </td>
                                    <td style={tableCellStyle}>
                                        <span style={{
                                            ...statusBadgeStyle,
                                            backgroundColor: getStatusColor(application.status)
                                        }}>
                                            {application.status}
                                        </span>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <button
                                            onClick={() => viewApplicationDetails(application)}
                                            style={actionButtonStyle}
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

    const getStatusColor = (status) => {
        const colors = {
            'Applied': '#007bff',
            'Reviewed': '#ffc107',
            'Interview Scheduled': '#17a2b8',
            'Selected': '#28a745',
            'Rejected': '#dc3545'
        };
        return colors[status] || '#6c757d';
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
                    postId: jobPost._id,
                    postType: 'job',
                    applicationId,
                    newStatus
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Update the local state
                setJobPost(prevJobPost => ({
                    ...prevJobPost,
                    applications: prevJobPost.applications.map(app => 
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
        <div style={containerStyle}>
            <button onClick={() => router.back()} style={backButtonStyle}>
                &larr; Back to Admin Dashboard
            </button>
            <h1 style={headingStyle}>Job Post Details</h1>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                <span style={{ fontWeight: 'bold' }}>Organization:</span> {jobPost.organizationName} |
                <span style={{ fontWeight: 'bold' }}> Designation:</span> {jobPost.jobDesignation}
            </p>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                 <span style={{ fontWeight: 'bold' }}>Announced to Students:</span> {jobPost.isAnnounced ? 'Yes' : 'No'}
            </p>

            {renderSection('About Organization', {
                dateSubmitted: jobPost.dateSubmitted,
                organizationName: jobPost.organizationName,
                website: jobPost.website,
                organizationType: jobPost.organizationType,
                organizationTypeOther: jobPost.organizationTypeOther,
                industrySector: jobPost.industrySector,
                industrySectorOther: jobPost.industrySectorOther,
            })}

            {renderSection('Job Profile', {
                jobDesignation: jobPost.jobDesignation,
                jobDescription: jobPost.jobDescription,
                tentativeDateOfJoining: jobPost.tentativeDateOfJoining,
                placeOfPosting: jobPost.placeOfPosting,
            })}

            {renderSection('Degree/Discipline Required', jobPost.requiredBranches)}

            {renderSection('Number of Positions', {
                numberOfPositions: jobPost.numberOfPositions,
            })}

            {renderSection('Candidate Requirements', {
                cgpaRequirements: jobPost.cgpaRequirements,
                medicalRequirements: jobPost.medicalRequirements,
                anyOtherRequirement: jobPost.anyOtherRequirement,
            })}

            {renderSection('Remuneration Package Details', jobPost.remuneration)}

            {renderSection('Company Policy', {
                companyAccommodationProvided: jobPost.companyAccommodationProvided,
                serviceAgreementRequired: jobPost.serviceAgreementRequired,
                serviceAgreementDuration: jobPost.serviceAgreementDuration,
                differentialPayForNITs: jobPost.differentialPayForNITs,
            })}

            {renderSection('Selection Procedure', {
                numberOfExecutivesVisiting: jobPost.numberOfExecutivesVisiting,
                numberOfRoomsRequired: jobPost.numberOfRoomsRequired,
                prePlacementTalkRequired: jobPost.prePlacementTalkRequired,
                technicalPresentationRequired: jobPost.technicalPresentationRequired,
                selectionProcess: jobPost.selectionProcess,
                finalOfferAnnouncement: jobPost.finalOfferAnnouncement,
            })}
                {renderSection('Company Policy', {
                                    preferredDatesForCampusVisit: jobPost.preferredDatesForCampusVisit,

                companyAccommodationProvided: jobPost.companyAccommodationProvided,
                serviceAgreementRequired: jobPost.serviceAgreementRequired,
                serviceAgreementDuration: jobPost.serviceAgreementDuration,
                differentialPayForNITs: jobPost.differentialPayForNITs,
            })}
            {renderSection('Contact Information', {
                contactPerson: jobPost.contactPerson,
                emailAddress: jobPost.emailAddress,
                contactAddress: jobPost.contactAddress,
                mobileNo: jobPost.mobileNo,
                phone: jobPost.phone,
                fax: jobPost.fax,
            })}

            {renderSection('Signature', {
                signatureName: jobPost.signatureName,
                signatureDesignation: jobPost.signatureDesignation,
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

// Basic Styles
const containerStyle = {
    padding: '30px',
    maxWidth: '900px',
    margin: '30px auto',
    backgroundColor: '#fefefe',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
};

const headingStyle = {
    textAlign: 'center',
    color: '#0056b3',
    marginBottom: '25px',
    fontSize: '2.2em',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
};

const sectionStyle = {
    marginBottom: '30px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
};

const sectionTitleStyle = {
    color: '#0056b3',
    marginBottom: '15px',       
    fontSize: '1.5em',
    borderBottom: '1px dashed #d0d0d0',
    paddingBottom: '8px',
};

const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '15px',
};

const detailItemStyle = {
    backgroundColor: '#fff',
    padding: '12px 15px',
    borderRadius: '5px',
    border: '1px solid #e9e9e9',
    wordBreak: 'break-word',
};

const fullWidthDetailItemStyle = {
    gridColumn: '1 / -1', // Span across all columns
    backgroundColor: '#fff',
    padding: '12px 15px',
    borderRadius: '5px',
    border: '1px solid #e9e9e9',
    wordBreak: 'break-word',
};

const backButtonStyle = {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '20px',
    fontSize: '1em',
    display: 'inline-block',
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const tableHeaderStyle = {
    padding: '12px 15px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333',
    borderBottom: '2px solid #e0e0e0'
};

const tableCellStyle = {
    padding: '12px 15px',
    borderBottom: '1px solid #f0f0f0',
    verticalAlign: 'middle'
};

const statusBadgeStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.8em',
    fontWeight: 'bold',
    display: 'inline-block'
};

const actionButtonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8em',
    transition: 'background-color 0.2s'
};
