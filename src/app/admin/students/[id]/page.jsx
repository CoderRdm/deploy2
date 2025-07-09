'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast'; // Assuming you use react-hot-toast
import Modal from '@/components/Modal'; // Assuming you have a Modal component

export default function StudentDetailPage({ params }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [id, setId] = useState(null); // Will be set from params

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [redFlagReason, setRedFlagReason] = useState(''); // State for new red flag reason
    const [redFlagError, setRedFlagError] = useState(null);
    const [addingRedFlag, setAddingRedFlag] = useState(false);

    // State for Generic Confirmation Modal
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmCallback, setConfirmCallback] = useState(null);

    // --- Generic Confirmation Modal Functions ---
    const openConfirmModal = (title, message, callback) => {
        setConfirmTitle(title);
        setConfirmMessage(message);
        setConfirmCallback(() => callback); // Store the callback function
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setConfirmTitle('');
        setConfirmMessage('');
        setConfirmCallback(null);
    };


    const fetchStudentDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/students/${id}`); // Call your API route
            const data = await res.json();
            if (res.ok) {
                setStudent(data.data);
            } else {
                setError(data.message || 'Failed to fetch student details.');
            }
        } catch (err) {
            console.error('Error fetching student details:', err);
            setError('An unexpected error occurred while fetching student details.');
        } finally {
            setLoading(false);
        }
    }, [id]); // Depend on 'id' so it refetches when ID changes

    useEffect(() => {
        // Next.js dynamic routes pass params as an object, which might be a Promise or plain object.
        // Ensure params.id is resolved before setting it.
        if (params && params.id) {
            setId(params.id);
        }
    }, [params]);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session.user.role !== 'admin') {
            router.replace('/admin/login'); // Redirect if not authenticated as admin
            return;
        }

        if (id) { // Ensure ID is available before fetching
            fetchStudentDetails();
        }
    }, [id, session, status, router, fetchStudentDetails]); // Add fetchStudentDetails to dependencies

    const handleAddRedFlag = useCallback(async () => {
        if (!redFlagReason.trim()) {
            setRedFlagError('Red flag reason cannot be empty.');
            toast.error('Red flag reason cannot be empty.');
            return;
        }

        setAddingRedFlag(true);
        setRedFlagError(null);
        try {
            const res = await fetch(`/api/admin/students/${id}`, {
                method: 'PATCH', // Use the PATCH method
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: 'add_red_flag', reason: redFlagReason.trim() }),
            });
            const data = await res.json();

            if (res.ok) {
                setStudent(data.data); // Update student state with new red flag
                setRedFlagReason(''); // Clear input field
                toast.success('Red flag added successfully!');
            } else {
                setRedFlagError(data.message || 'Failed to add red flag.');
                toast.error(data.message || 'Failed to add red flag.');
            }
        } catch (err) {
            console.error('Error adding red flag:', err);
            setRedFlagError('An unexpected error occurred while adding the red flag.');
            toast.error('An unexpected error occurred while adding the red flag.');
        } finally {
            setAddingRedFlag(false);
        }
    }, [id, redFlagReason]);

    const handleDeleteRedFlag = useCallback(async (flagId) => {
        if (!flagId) {
            toast.error('Invalid red flag ID.');
            return;
        }

        openConfirmModal(
            'Delete Red Flag',
            'Are you sure you want to delete this red flag?',
            async () => {
                try {
                    const res = await fetch(`/api/admin/students/${id}/red-flags/${flagId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    const data = await res.json();

                    if (res.ok) {
                        // Update student state with the updated red flags list
                        setStudent(data.data);
                        toast.success('Red flag deleted successfully!');
                    } else {
                        toast.error(data.message || 'Failed to delete red flag.');
                    }
                } catch (err) {
                    console.error('Error deleting red flag:', err);
                    toast.error('An unexpected error occurred while deleting the red flag.');
                }
            }
        );
    }, [id]);

    const handleCleanupLegacyRedFlags = useCallback(async (studentId) => {
        openConfirmModal(
            'Clean Up Legacy Red Flags',
            'This will remove all legacy red flag data that cannot be properly managed. Only properly structured red flags will remain. Continue?',
            async () => {
                try {
                    const res = await fetch(`/api/admin/students/${studentId}/cleanup-redflags`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    const data = await res.json();

                    if (res.ok) {
                        setStudent(data.data);
                        toast.success(data.message);
                    } else {
                        toast.error(data.message || 'Failed to cleanup legacy red flags.');
                    }
                } catch (err) {
                    console.error('Error cleaning up legacy red flags:', err);
                    toast.error('An unexpected error occurred while cleaning up legacy red flags.');
                }
            }
        );
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-xl text-gray-700">Loading student details...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-xl text-red-600">Error: {error}</div>;
    }

    if (!student) {
        return <div className="flex justify-center items-center h-screen text-xl text-gray-700">Student not found.</div>;
    }

    // Helper to render sections only if data exists
    const renderDetailItem = (label, value) => {
        let displayValue;

        if (value === null || value === undefined || value === '') {
            displayValue = 'N/A';
        } else if (typeof value === 'boolean') {
            displayValue = value ? 'Yes' : 'No';
        } else if (label.includes('Score') || label === 'CGPA') {
            if (typeof value === 'number') {
                if (label.includes('Score')) {
                    displayValue = `${value}%`;
                } else if (label === 'CGPA') {
                    displayValue = value.toFixed(2);
                } else {
                    displayValue = value;
                }
            } else {
                displayValue = value;
            }
        }
        else if (
            (value instanceof Date && !isNaN(value)) ||
            (typeof value === 'string' && !isNaN(new Date(value)))
        ) {
            const dateObj = new Date(value);
            if (!isNaN(dateObj.getTime())) {
                displayValue = dateObj.toLocaleDateString();
            } else {
                displayValue = 'Invalid Date String';
            }
        } else if (Array.isArray(value)) {
            displayValue = value.length > 0 ? value.join(', ') : 'N/A';
        } else {
            displayValue = String(value);
        }

        return (
            <div className="bg-white p-4 rounded-md border border-gray-200 break-words shadow-sm">
                <strong className="text-gray-700">{label}:</strong> <span className="text-gray-900">{displayValue}</span>
            </div>
        );
    };

    return (
        <div className="p-8 max-w-4xl mx-auto my-8 bg-gray-50 rounded-xl shadow-lg font-sans leading-relaxed">
            <button onClick={() => router.back()} className="mb-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md hover:shadow-lg">
                &larr; Back to Student List
            </button>
            <h1 className="text-center text-blue-700 mb-6 text-4xl font-extrabold border-b-2 border-gray-200 pb-4">Student Profile Details</h1>
            <p className="text-center mb-5 text-gray-600">
                <span className="font-bold">Name:</span> {student.name} |
                <span className="font-bold"> Email:</span> {student.email}
            </p>
            <p className="text-center mb-8 text-gray-600">
                <span className="font-bold">Student ID:</span> {student.student_id} |
                <span className="font-bold"> Profile Completed:</span> {student.profile_completed ? 'Yes' : 'No'}
            </p>

            <div className="mb-8 border border-gray-200 rounded-lg p-6 bg-white shadow-md">
                <h3 className="text-blue-700 mb-4 text-2xl font-semibold border-b border-dashed border-gray-300 pb-2">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderDetailItem('Year', student.year)}
                    {renderDetailItem('Branch', student.branch)}
                    {renderDetailItem('Gender', student.gender)}
                    {renderDetailItem('Date of Birth', student.dob)}
                    {renderDetailItem('Father\'s Name', student.father_name)}
                    {renderDetailItem('Current Semester', student.current_semester)}
                </div>
            </div>

            <div className="mb-8 border border-gray-200 rounded-lg p-6 bg-white shadow-md">
                <h3 className="text-blue-700 mb-4 text-2xl font-semibold border-b border-dashed border-gray-300 pb-2">Placement Availability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-md border border-gray-200 break-words shadow-sm">
                        <strong className="text-gray-700">Available for Placement:</strong>
                        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                            student.availableForPlacement 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                        }`}>
                            {student.availableForPlacement ? 'Yes' : 'No'}
                        </span>
                    </div>
                    {student.placementAvailabilityUpdatedAt && (
                        <div className="bg-white p-4 rounded-md border border-gray-200 break-words shadow-sm">
                            <strong className="text-gray-700">Availability Last Updated:</strong>
                            <span className="text-gray-900"> {new Date(student.placementAvailabilityUpdatedAt).toLocaleDateString()} at {new Date(student.placementAvailabilityUpdatedAt).toLocaleTimeString()}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-8 border border-gray-200 rounded-lg p-6 bg-white shadow-md">
                <h3 className="text-blue-700 mb-4 text-2xl font-semibold border-b border-dashed border-gray-300 pb-2">Academic Scores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderDetailItem('10th Score', student.tenth_score)}
                    {renderDetailItem('12th Score', student.twelfth_score)}
                    {renderDetailItem('CGPA', student.cgpa?.overall)}
                </div>
            </div>

            {/* --- RED FLAGS SECTION --- */}
            <div className="mb-8 border border-red-300 rounded-lg p-6 bg-red-50 shadow-md">
                <div className="flex justify-between items-center mb-4 border-b border-dashed border-red-300 pb-2">
                    <h3 className="text-red-700 text-2xl font-semibold">Red Flags</h3>
                    {student.redflags && student.redflags.some(flag => !flag._id) && (
                        <button
                            onClick={() => handleCleanupLegacyRedFlags(student._id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-2 px-4 rounded-md transition duration-300 ease-in-out"
                        >
                            Clean Legacy Data
                        </button>
                    )}
                </div>
                <div className="max-h-52 overflow-y-auto pr-2"> {/* Added max-height and overflow for scrolling */}
                    {student.redflags && student.redflags.length > 0 ? (
                        student.redflags.map((flag, index) => (
                            <div key={flag._id || `legacy-${index}`} className="bg-red-100 p-3 rounded-md mb-3 border-l-4 border-red-500 flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-medium text-red-800"><strong>Reason:</strong> {flag.reason || flag.toString() || 'Legacy red flag'}</p>
                                    <p className="text-gray-600 text-xs mt-1">
                                        Added by {flag.assignedBy || 'Unknown'} on {flag.createdAt && !isNaN(new Date(flag.createdAt)) ? new Date(flag.createdAt).toLocaleDateString() : 'Unknown Date'}
                                        {!flag._id && <span className="text-orange-600 ml-2">(Legacy data)</span>}
                                    </p>
                                </div>
                                {flag._id ? (
                                    <button
                                        onClick={() => handleDeleteRedFlag(flag._id)}
                                        className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md text-xs transition duration-300 ease-in-out shadow-sm hover:shadow-md"
                                    >
                                        Delete
                                    </button>
                                ) : (
                                    <span className="text-orange-600 text-xs px-3 py-1 bg-orange-100 rounded-md">Cannot delete legacy data</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600 text-lg">No red flags for this student.</p>
                    )}
                </div>
                <div className="mt-6 pt-4 border-t border-dashed border-gray-300">
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">Add New Red Flag</h4>
                    <textarea
                        value={redFlagReason}
                        onChange={(e) => setRedFlagReason(e.target.value)}
                        placeholder="Add a new red flag reason..."
                        rows="3"
                        className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent text-base resize-y mb-3"
                    />
                    {redFlagError && <p className="text-red-500 text-sm mt-1">{redFlagError}</p>}
                    <button
                        onClick={handleAddRedFlag}
                        disabled={addingRedFlag}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {addingRedFlag ? 'Adding...' : 'Add Red Flag'}
                    </button>
                </div>
            </div>
            {/* --- END RED FLAGS SECTION --- */}

            <div className="mb-8 border border-gray-200 rounded-lg p-6 bg-white shadow-md">
                <h3 className="text-blue-700 mb-4 text-2xl font-semibold border-b border-dashed border-gray-300 pb-2">Timestamps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderDetailItem('Joined On', student.createdAt)}
                    {renderDetailItem('Last Updated', student.updatedAt)}
                </div>
            </div>

            {/* Generic Confirmation Modal */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    closeConfirmModal();
                    toast.error('Action cancelled.'); // Optional: Notify user of cancellation
                }}
                title={confirmTitle}
            >
                <p className="text-gray-700 text-base mb-6">{confirmMessage}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => {
                            if (confirmCallback) {
                                confirmCallback();
                            }
                            closeConfirmModal();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => {
                            closeConfirmModal();
                            toast.error('Action cancelled.');
                        }}
                        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                    >
                        No
                    </button>
                </div>
            </Modal>
        </div>
    );
}