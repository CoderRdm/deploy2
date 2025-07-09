'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast'; // Assuming you use react-hot-toast
import Modal from '@/components/Modal'; // Assuming you have a Modal component

export default function AdminStudentsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [allStudents, setAllStudents] = useState([]); // Stores all students initially
    const [displayedStudents, setDisplayedStudents] = useState([]); // Students currently displayed (all or search results)
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true); // Initial loading for the page
    const [error, setError] = useState(null);
    const [studentLoading, setStudentLoading] = useState(false); // Loading state for student search/fetch
    const [newRedFlagReason, setNewRedFlagReason] = useState('');

    // State for Red Flag Modal
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isRedFlagModalOpen, setIsRedFlagModalOpen] = useState(false);

    // State for Generic Confirmation Modal
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmCallback, setConfirmCallback] = useState(null);


    // Debounce function to limit API calls while typing
    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);

        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            return () => {
                clearTimeout(handler);
            };
        }, [value, delay]);

        return debouncedValue;
    };

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // --- Red Flag Modal Functions ---
    const openRedFlagModal = (student) => {
        setSelectedStudent(student);
        setIsRedFlagModalOpen(true);
    };

    const closeRedFlagModal = () => {
        setSelectedStudent(null);
        setIsRedFlagModalOpen(false);
        setNewRedFlagReason(''); // Clear reason when closing
    };

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

    // --- Function to handle adding red flag by Admin (PATCH to /api/admin/students/[id]) ---
    const handleAddRedFlagForAdmin = async () => {
        if (!newRedFlagReason.trim()) {
            toast.error('Red flag reason cannot be empty.');
            return;
        }
        if (!selectedStudent || !selectedStudent._id) {
            toast.error('No student selected to add red flag.');
            return;
        }

        try {
            const res = await fetch(`/api/admin/students/${selectedStudent._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'add_red_flag', // Indicate the type of PATCH operation
                    reason: newRedFlagReason,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(data.message);
                setNewRedFlagReason(''); // Clear the input field
                // Update the selected student's red flags in state to reflect the change
                setSelectedStudent(prevStudent => ({
                    ...prevStudent,
                    redflags: data.data.redflags // Assuming data.data returns the updated student document
                }));
                // Also update the `allStudents` and `displayedStudents` to keep them consistent
                setAllStudents(prevStudents =>
                    prevStudents.map(s => (s._id === selectedStudent._id ? { ...s, redflags: data.data.redflags } : s))
                );
                setDisplayedStudents(prevStudents =>
                    prevStudents.map(s => (s._id === selectedStudent._id ? { ...s, redflags: data.data.redflags } : s))
                );

            } else {
                toast.error(data.message || 'Failed to add red flag.');
                console.error('Failed to add red flag:', data.message);
            }
        } catch (err) {
            console.error('Error adding red flag:', err);
            toast.error('An error occurred while adding the red flag.');
        }
    };

    // --- Function to handle red flag removal by Admin (DELETE to /api/admin/students/[id]/red-flags/[flagId]) ---
    const handleDeleteRedFlag = useCallback(async (studentId, flagId) => {
        if (!flagId || flagId === 'undefined' || typeof flagId === 'number') {
            toast.error('Invalid red flag ID. This red flag cannot be deleted (legacy data).');
            console.error('Invalid flagId:', flagId, 'Type:', typeof flagId);
            return;
        }

        openConfirmModal(
            'Remove Red Flag',
            'Are you sure you want to remove this red flag? This action cannot be undone.',
            async () => {
                try {
                    const res = await fetch(`/api/admin/students/${studentId}/red-flags/${flagId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    const data = await res.json();

                    if (res.ok) {
                        toast.success(data.message);
                        // Update the selected student's red flags in state to reflect the removal
                        setSelectedStudent(prevStudent => ({
                            ...prevStudent,
                            redflags: prevStudent.redflags.filter(flag => flag._id !== flagId)
                        }));
                        // Also update the main students list (allStudents and displayedStudents)
                        setAllStudents(prevStudents =>
                            prevStudents.map(student =>
                                student._id === studentId
                                    ? { ...student, redflags: student.redflags.filter(flag => flag._id !== flagId) }
                                    : student
                            )
                        );
                        setDisplayedStudents(prevStudents =>
                            prevStudents.map(student =>
                                student._id === studentId
                                    ? { ...student, redflags: student.redflags.filter(flag => flag._id !== flagId) }
                                    : student
                            )
                        );
                    } else {
                        toast.error(data.message || 'Failed to remove red flag.');
                        console.error('Failed to remove red flag:', data.message);
                    }
                } catch (err) {
                    console.error('Error deleting red flag:', err);
                    toast.error('An error occurred while removing the red flag.');
                }
            }
        );
    }, []);


    const fetchStudents = async () => {
        setStudentLoading(true);
        setError(null);
        try {
            const url = debouncedSearchQuery
                ? `/api/admin/students/search?q=${encodeURIComponent(debouncedSearchQuery)}`
                : '/api/admin/students';

            const res = await fetch(url);
            const data = await res.json();

            if (res.ok) {
                setAllStudents(data.data); // Keep all students in a master list
                setDisplayedStudents(data.data); // Update displayed students based on search
            } else {
                setError(data.message || 'Failed to fetch students.');
                setAllStudents([]);
                setDisplayedStudents([]);
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            setError('An unexpected error occurred while fetching students.');
            setAllStudents([]);
            setDisplayedStudents([]);
        } finally {
            setStudentLoading(false);
            setLoading(false); // Set main loading to false after initial student fetch
        }
    };

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session.user.role !== 'admin') {
            router.replace('/admin/login');
            return;
        }

        fetchStudents();
    }, [session, status, router, debouncedSearchQuery]); // Re-fetch on search query change or session ready

    const handleDeleteStudent = useCallback(async (studentId) => {
        openConfirmModal(
            'Delete Student',
            'Are you sure you want to delete this student? This action cannot be undone.',
            async () => {
                try {
                    const res = await fetch(`/api/admin/students/${studentId}`, {
                        method: 'DELETE',
                    });
                    if (res.ok) {
                        setAllStudents(prev => prev.filter(student => student._id !== studentId));
                        setDisplayedStudents(prev => prev.filter(student => student._id !== studentId));
                        toast.success('Student deleted successfully!');
                    } else {
                        const errorData = await res.json();
                        toast.error(errorData.message || 'Failed to delete student');
                    }
                } catch (err) {
                    console.error('Error deleting student:', err);
                    toast.error('Failed to delete student. Please try again.');
                }
            }
        );
    }, []);

    // --- NEW FUNCTION: Toggle SPC Status ---
    const handleToggleSPC = useCallback(async (studentId, currentIsSPC) => {
        openConfirmModal(
            `${currentIsSPC ? 'Revoke' : 'Grant'} SPC Status`,
            `Are you sure you want to ${currentIsSPC ? 'REVOKE' : 'GRANT'} SPC status for this student?`,
            async () => {
                try {
                    const res = await fetch(`/api/admin/students/${studentId}/toggle-spc`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ isSPC: !currentIsSPC }), // Toggle the status
                    });

                    const data = await res.json();

                    if (res.ok) {
                        toast.success(data.message);
                        // Update the student's isSPC status in the local state
                        setDisplayedStudents(prev =>
                            prev.map(student =>
                                student._id === studentId ? { ...student, isSPC: !currentIsSPC } : student
                            )
                        );
                        setAllStudents(prev => // Also update the full list
                            prev.map(student =>
                                student._id === studentId ? { ...student, isSPC: !currentIsSPC } : student
                            )
                        );
                    } else {
                        toast.error(data.message || 'Failed to update SPC status.');
                    }
                } catch (err) {
                    console.error('Error toggling SPC status:', err);
                    toast.error('An unexpected error occurred while updating SPC status.');
                }
            }
        );
    }, []);
    // --- END NEW FUNCTION ---

    // --- NEW FUNCTION: Toggle Placement Availability ---
    const handleTogglePlacementAvailability = useCallback(async (studentId, currentAvailabilityStatus) => {
        openConfirmModal(
            `${currentAvailabilityStatus ? 'Mark Unavailable' : 'Mark Available'} for Placement`,
            `Are you sure you want to ${currentAvailabilityStatus ? 'REMOVE this student from' : 'ADD this student to'} the placement pool?`,
            async () => {
                try {
                    const res = await fetch(`/api/admin/students/${studentId}/placement-availability`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ availableForPlacement: !currentAvailabilityStatus }),
                    });

                    const data = await res.json();

                    if (res.ok) {
                        toast.success(data.message);
                        // Update the student's placement availability in the local state
                        const updatedTimestamp = new Date();
                        setDisplayedStudents(prev =>
                            prev.map(student =>
                                student._id === studentId ? { 
                                    ...student, 
                                    availableForPlacement: !currentAvailabilityStatus,
                                    placementAvailabilityUpdatedAt: updatedTimestamp
                                } : student
                            )
                        );
                        setAllStudents(prev => // Also update the full list
                            prev.map(student =>
                                student._id === studentId ? { 
                                    ...student, 
                                    availableForPlacement: !currentAvailabilityStatus,
                                    placementAvailabilityUpdatedAt: updatedTimestamp
                                } : student
                            )
                        );
                    } else {
                        toast.error(data.message || 'Failed to update placement availability.');
                    }
                } catch (err) {
                    console.error('Error toggling placement availability:', err);
                    toast.error('An unexpected error occurred while updating placement availability.');
                }
            }
        );
    }, []);
    // --- END NEW FUNCTION ---

    // --- NEW FUNCTION: Clean up legacy red flags ---
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
                        toast.success(data.message);
                        // Update the student's red flags in the local state
                        setDisplayedStudents(prev =>
                            prev.map(student =>
                                student._id === studentId ? { 
                                    ...student, 
                                    redflags: data.data.redflags
                                } : student
                            )
                        );
                        setAllStudents(prev => // Also update the full list
                            prev.map(student =>
                                student._id === studentId ? { 
                                    ...student, 
                                    redflags: data.data.redflags
                                } : student
                            )
                        );
                        // Update selected student if it's the same one
                        if (selectedStudent && selectedStudent._id === studentId) {
                            setSelectedStudent(prev => ({ ...prev, redflags: data.data.redflags }));
                        }
                    } else {
                        toast.error(data.message || 'Failed to cleanup legacy red flags.');
                    }
                } catch (err) {
                    console.error('Error cleaning up legacy red flags:', err);
                    toast.error('An unexpected error occurred while cleaning up legacy red flags.');
                }
            }
        );
    }, [selectedStudent]);
    // --- END NEW FUNCTION ---

    // Handle click to view single student details
    const handleViewStudentDetails = (studentId) => {
        router.push(`/admin/students/${studentId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-gray-700">
                Loading student data...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-red-600">
                Error: {error}
            </div>
        );
    }

    if (!session || session.user.role !== 'admin') {
        return null; // Should redirect via useEffect, but a fallback
    }

    return (
        <div className="p-8 max-w-7xl mx-auto my-8 bg-gray-50 rounded-xl shadow-lg font-sans leading-relaxed">
            <h1 className="text-center text-gray-800 mb-8 text-4xl font-extrabold border-b-2 border-gray-200 pb-4">
                Manage Registered Students
            </h1>

            <button
                onClick={() => router.back()}
                className="mb-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md hover:shadow-lg"
            >
                &larr; Back to Dashboard
            </button>

            <section className="mb-10">
                <h2 className="text-purple-700 text-3xl font-semibold mb-6 border-b-2 border-purple-200 pb-3">
                    Student Records ({displayedStudents.length})
                </h2>
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search students by name, email, ID, or branch..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                </div>

                {studentLoading ? (
                    <div className="text-center text-lg text-gray-700 py-5">Searching students...</div>
                ) : displayedStudents.length === 0 ? (
                    <p className="text-gray-600 text-lg py-5">No students found matching your criteria or no student data available yet.</p>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGPA</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile Complete</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Red Flags</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SPC</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available for Placement</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayedStudents.map(student => (
                                    <tr key={student._id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.student_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.year}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.branch}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.cgpa?.overall || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.profile_completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {student.profile_completed ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                                            {student.redflags && student.redflags.length > 0 ? (
                                                <button
                                                    onClick={() => openRedFlagModal(student)}
                                                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-xs transition duration-300 ease-in-out"
                                                >
                                                    View ({student.redflags.length})
                                                </button>
                                            ) : (
                                                <span className="text-gray-500">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                                            <span className={`font-bold ${student.isSPC ? 'text-green-600' : 'text-red-600'}`}>
                                                {student.isSPC ? 'Yes' : 'No'}
                                            </span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleToggleSPC(student._id, student.isSPC); }}
                                                className={`ml-3 py-1 px-3 rounded-md text-white text-xs transition duration-300 ease-in-out
                                                    ${student.isSPC ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                                            >
                                                {student.isSPC ? 'Revoke SPC' : 'Grant SPC'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.availableForPlacement ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                {student.availableForPlacement ? 'Available' : 'Not Available'}
                                            </span>
                                            {student.placementAvailabilityUpdatedAt && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Updated: {new Date(student.placementAvailabilityUpdatedAt).toLocaleDateString()}
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleTogglePlacementAvailability(student._id, student.availableForPlacement); }}
                                                className={`ml-3 py-1 px-3 rounded-md text-white text-xs transition duration-300 ease-in-out
                                                    ${student.availableForPlacement ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}
                                            >
                                                {student.availableForPlacement ? 'Mark Unavailable' : 'Mark Available'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => handleDeleteStudent(student._id)} className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md mr-2 text-xs transition duration-300 ease-in-out">Delete</button>
                                            <button onClick={() => handleViewStudentDetails(student._id)} className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-xs transition duration-300 ease-in-out">Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Red Flag Management Modal for Admin */}
            {selectedStudent && (
                <Modal
                    isOpen={isRedFlagModalOpen}
                    onClose={closeRedFlagModal}
                    title={`Manage Red Flags for ${selectedStudent.name} (${selectedStudent.student_id})`}
                >
                    <div className="mb-5 pb-4 border-b border-dashed border-gray-200">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Add New Red Flag</h3>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-md min-h-[80px] focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                            placeholder="Enter reason for red flag..."
                            value={newRedFlagReason}
                            onChange={(e) => setNewRedFlagReason(e.target.value)}
                        ></textarea>
                        <button
                            onClick={handleAddRedFlagForAdmin}
                            className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out shadow-sm hover:shadow-md"
                        >
                            Add Red Flag
                        </button>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">Existing Red Flags ({selectedStudent.redflags?.length || 0})</h3>
                            {selectedStudent.redflags && selectedStudent.redflags.some(flag => !flag._id) && (
                                <button
                                    onClick={() => handleCleanupLegacyRedFlags(selectedStudent._id)}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-1 px-3 rounded-md transition duration-300 ease-in-out"
                                >
                                    Clean Legacy Data
                                </button>
                            )}
                        </div>
                                        {selectedStudent.redflags && selectedStudent.redflags.length > 0 ? (
                                            <ul className="list-disc pl-5 space-y-2">
                                                {selectedStudent.redflags.map((flag, index) => (
                                                    <li key={flag._id || `legacy-${index}`} className="bg-red-50 text-red-800 p-3 rounded-md flex justify-between items-center text-sm">
                                                        <span>
                                                            {flag.reason || flag.toString() || 'Legacy red flag'} 
                                                            (Added: {flag.createdAt ? new Date(flag.createdAt).toLocaleDateString() : 'Unknown'})
                                                            {!flag._id && <span className="text-orange-600 text-xs ml-2">(Legacy data)</span>}
                                                        </span>
                                                        {flag._id ? (
                                                            <button
                                                                onClick={() => handleDeleteRedFlag(selectedStudent._id, flag._id)}
                                                                className="ml-4 bg-red-700 hover:bg-red-800 text-white py-1 px-3 rounded-md text-xs transition duration-300 ease-in-out"
                                                            >
                                                                Remove
                                                            </button>
                                                        ) : (
                                                            <span className="ml-4 text-orange-600 text-xs">Cannot delete legacy data</span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                        ) : (
                            <p className="text-gray-600">No red flags for this student.</p>
                        )}
                    </div>
                </Modal>
            )}

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