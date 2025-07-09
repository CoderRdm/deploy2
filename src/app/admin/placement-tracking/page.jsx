'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function PlacementTrackingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        status: 'all',
        company: '',
        position: ''
    });

    // Modal states
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState('');

    // Form states
    const [placementForm, setPlacementForm] = useState({
        companyName: '',
        position: '',
        ctc: '',
        joiningDate: '',
        workLocation: '',
        offerType: 'Regular'
    });

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session.user.role !== 'admin') {
            router.replace('/admin/login');
            return;
        }

        fetchStudentData();
    }, [session, status, router, filters]);

    const fetchStudentData = async () => {
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();
            if (filters.status !== 'all') queryParams.append('status', filters.status);
            if (filters.company) queryParams.append('company', filters.company);
            if (filters.position) queryParams.append('position', filters.position);

            const response = await fetch(`/api/admin/students/placement-tracking?${queryParams.toString()}`);
            const data = await response.json();

            if (response.ok) {
                setStudents(data.data);
                setStats(data.stats);
            } else {
                setError(data.message || 'Failed to fetch placement data');
                toast.error(data.message || 'Failed to fetch placement data');
            }
        } catch (err) {
            console.error('Error fetching placement data:', err);
            setError('An unexpected error occurred');
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const openModal = (student, action) => {
        setSelectedStudent(student);
        setModalAction(action);
        setIsModalOpen(true);
        
        // Pre-fill form if editing
        if (action === 'add_final_placement' && student.placements?.finalJob) {
            setPlacementForm({
                companyName: student.placements.finalJob.companyName || '',
                position: student.placements.finalJob.position || '',
                ctc: student.placements.finalJob.ctc || '',
                joiningDate: student.placements.finalJob.joiningDate ? 
                    new Date(student.placements.finalJob.joiningDate).toISOString().split('T')[0] : '',
                workLocation: student.placements.finalJob.workLocation || '',
                offerType: student.placements.finalJob.offerType || 'Regular'
            });
        } else {
            setPlacementForm({
                companyName: '',
                position: '',
                ctc: '',
                joiningDate: '',
                workLocation: '',
                offerType: 'Regular'
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedStudent(null);
        setModalAction('');
        setPlacementForm({
            companyName: '',
            position: '',
            ctc: '',
            joiningDate: '',
            workLocation: '',
            offerType: 'Regular'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedStudent) return;

        try {
            const requestData = {
                studentId: selectedStudent._id,
                action: modalAction,
                placementData: {
                    ...placementForm,
                    ctc: placementForm.ctc ? parseFloat(placementForm.ctc) : null,
                    joiningDate: placementForm.joiningDate ? new Date(placementForm.joiningDate) : null
                }
            };

            const response = await fetch('/api/admin/students/placement-tracking', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            
            if (response.ok) {
                toast.success(data.message);
                closeModal();
                fetchStudentData(); // Refresh data
            } else {
                toast.error(data.message || 'Failed to update placement');
            }
        } catch (error) {
            console.error('Error updating placement:', error);
            toast.error('An error occurred while updating placement');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return `₹${amount.toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-gray-700">
                Loading placement tracking data...
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
        return null;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto my-8 bg-gray-50 rounded-xl shadow-lg font-sans leading-relaxed">
            <h1 className="text-center text-gray-800 mb-8 text-4xl font-extrabold border-b-2 border-gray-200 pb-4">
                Student Placement Tracking
            </h1>

            <button
                onClick={() => router.back()}
                className="mb-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md hover:shadow-lg"
            >
                ← Back to Dashboard
            </button>

            {/* Statistics Summary */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Placement Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <h3 className="text-lg font-semibold text-blue-700">Total Students</h3>
                        <p className="text-2xl font-bold text-blue-900">{stats.totalStudents || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <h3 className="text-lg font-semibold text-green-700">Applied Students</h3>
                        <p className="text-2xl font-bold text-green-900">{stats.studentsWithApplications || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                        <h3 className="text-lg font-semibold text-purple-700">Selected Students</h3>
                        <p className="text-2xl font-bold text-purple-900">{stats.studentsWithSelections || 0}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                        <h3 className="text-lg font-semibold text-orange-700">Total Applications</h3>
                        <p className="text-2xl font-bold text-orange-900">{stats.totalApplications || 0}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                        <h3 className="text-lg font-semibold text-red-700">Total Selections</h3>
                        <p className="text-2xl font-bold text-red-900">{stats.totalSelections || 0}</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                        <h3 className="text-lg font-semibold text-indigo-700">Placement Rate</h3>
                        <p className="text-2xl font-bold text-indigo-900">{stats.placementRate || 0}%</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Students</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Students</option>
                            <option value="applied">With Applications</option>
                            <option value="selected">Selected Students</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                        <input
                            type="text"
                            value={filters.company}
                            onChange={(e) => handleFilterChange('company', e.target.value)}
                            placeholder="Filter by company name"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                        <input
                            type="text"
                            value={filters.position}
                            onChange={(e) => handleFilterChange('position', e.target.value)}
                            placeholder="Filter by position"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Student Placement Status ({students.length})
                    </h2>
                </div>
                
                {students.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-lg">No students found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selections</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Placement</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                <div className="text-sm text-gray-500">{student.student_id}</div>
                                                <div className="text-sm text-gray-500">{student.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <div>Year: {student.year}</div>
                                                <div>Branch: {student.branch}</div>
                                                <div>CGPA: {student.cgpa?.overall || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <div className="font-medium">{student.totalApplications || 0} Total</div>
                                                {student.appliedApplications && student.appliedApplications.length > 0 && (
                                                    <div className="text-xs text-gray-500 max-w-xs">
                                                        Recent: {student.appliedApplications.slice(0, 2).map(app => 
                                                            `${app.companyName} (${app.currentStatus})`
                                                        ).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <div className="font-medium text-green-600">{student.totalSelections || 0} Selected</div>
                                                {student.selectedApplications && student.selectedApplications.length > 0 && (
                                                    <div className="text-xs text-gray-500 max-w-xs">
                                                        {student.selectedApplications.slice(0, 2).map(app => 
                                                            `${app.companyName} - ${app.position}`
                                                        ).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {student.placements?.finalJob ? (
                                                <div className="text-sm text-gray-900">
                                                    <div className="font-medium text-green-600">{student.placements.finalJob.companyName}</div>
                                                    <div className="text-xs text-gray-500">{student.placements.finalJob.position}</div>
                                                    <div className="text-xs text-gray-500">{formatCurrency(student.placements.finalJob.ctc)}</div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Not placed</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openModal(student, 'add_final_placement')}
                                                    className="text-green-600 hover:text-green-900 px-2 py-1 rounded text-xs bg-green-50 hover:bg-green-100"
                                                >
                                                    {student.placements?.finalJob ? 'Edit' : 'Add'} Placement
                                                </button>
                                                {student.placements?.finalJob && (
                                                    <button
                                                        onClick={() => openModal(student, 'remove_final_placement')}
                                                        className="text-red-600 hover:text-red-900 px-2 py-1 rounded text-xs bg-red-50 hover:bg-red-100"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {modalAction === 'add_final_placement' ? 'Add/Edit Final Placement' : 'Remove Final Placement'}
                        </h3>
                        
                        {modalAction === 'add_final_placement' ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={placementForm.companyName}
                                        onChange={(e) => setPlacementForm({...placementForm, companyName: e.target.value})}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                    <input
                                        type="text"
                                        value={placementForm.position}
                                        onChange={(e) => setPlacementForm({...placementForm, position: e.target.value})}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CTC (₹)</label>
                                    <input
                                        type="number"
                                        value={placementForm.ctc}
                                        onChange={(e) => setPlacementForm({...placementForm, ctc: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                                    <input
                                        type="date"
                                        value={placementForm.joiningDate}
                                        onChange={(e) => setPlacementForm({...placementForm, joiningDate: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Location</label>
                                    <input
                                        type="text"
                                        value={placementForm.workLocation}
                                        onChange={(e) => setPlacementForm({...placementForm, workLocation: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Offer Type</label>
                                    <select
                                        value={placementForm.offerType}
                                        onChange={(e) => setPlacementForm({...placementForm, offerType: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="Regular">Regular</option>
                                        <option value="PPO">PPO</option>
                                        <option value="Lateral">Lateral</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Save Placement
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to remove the final placement for {selectedStudent?.name}?
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        Remove Placement
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
