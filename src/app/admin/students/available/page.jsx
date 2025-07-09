'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function AvailableStudentsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({ total: 0, byBranch: {}, byYear: {}, averageCGPA: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        branch: 'all',
        year: 'all',
        minCGPA: ''
    });

    const branches = ['CSE', 'IT', 'ECE', 'EEE', 'EE', 'Civil', 'Mechanical', 'Electrical'];
    const years = ['1st', '2nd', '3rd', '4th', 'Alumni'];

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session.user.role !== 'admin') {
            router.replace('/admin/login');
            return;
        }

        fetchAvailableStudents();
    }, [session, status, router, filters]);

    const fetchAvailableStudents = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();
            if (filters.branch !== 'all') queryParams.append('branch', filters.branch);
            if (filters.year !== 'all') queryParams.append('year', filters.year);
            if (filters.minCGPA) queryParams.append('minCGPA', filters.minCGPA);

            const response = await fetch(`/api/admin/students/available?${queryParams.toString()}`);
            const data = await response.json();

            if (response.ok) {
                setStudents(data.data);
                setStats(data.stats);
            } else {
                setError(data.message || 'Failed to fetch available students');
                toast.error(data.message || 'Failed to fetch available students');
            }
        } catch (err) {
            console.error('Error fetching available students:', err);
            setError('An unexpected error occurred');
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const handleViewStudentDetails = (studentId) => {
        router.push(`/admin/students/${studentId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-gray-700">
                Loading available students...
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
                Students Available for Placement
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <h3 className="text-lg font-semibold text-blue-700">Total Available</h3>
                        <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <h3 className="text-lg font-semibold text-green-700">Average CGPA</h3>
                        <p className="text-2xl font-bold text-green-900">{stats.averageCGPA || 'N/A'}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                        <h3 className="text-lg font-semibold text-purple-700">Branches</h3>
                        <p className="text-sm text-purple-900">
                            {Object.keys(stats.byBranch).length} different branches
                        </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                        <h3 className="text-lg font-semibold text-orange-700">Years</h3>
                        <p className="text-sm text-orange-900">
                            {Object.keys(stats.byYear).length} different years
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Students</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                        <select
                            value={filters.branch}
                            onChange={(e) => handleFilterChange('branch', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Branches</option>
                            {branches.map(branch => (
                                <option key={branch} value={branch}>{branch}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <select
                            value={filters.year}
                            onChange={(e) => handleFilterChange('year', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Years</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum CGPA</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={filters.minCGPA}
                            onChange={(e) => handleFilterChange('minCGPA', e.target.value)}
                            placeholder="e.g., 7.0"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Students List */}
            <section className="mb-10">
                <h2 className="text-purple-700 text-3xl font-semibold mb-6 border-b-2 border-purple-200 pb-3">
                    Available Students ({students.length})
                </h2>

                {students.length === 0 ? (
                    <p className="text-gray-600 text-lg py-5 text-center">
                        No students are currently available for placement with the selected filters.
                    </p>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">10th Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">12th Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Since</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map(student => (
                                    <tr key={student._id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.student_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.year}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.branch}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {student.cgpa?.overall ? student.cgpa.overall.toFixed(2) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {student.tenth_score ? `${student.tenth_score}%` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {student.twelfth_score ? `${student.twelfth_score}%` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {student.placementAvailabilityUpdatedAt 
                                                ? new Date(student.placementAvailabilityUpdatedAt).toLocaleDateString()
                                                : 'N/A'
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button 
                                                onClick={() => handleViewStudentDetails(student._id)} 
                                                className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-xs transition duration-300 ease-in-out"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Branch-wise and Year-wise Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Branch-wise Distribution</h3>
                    {Object.keys(stats.byBranch).length > 0 ? (
                        <div className="space-y-2">
                            {Object.entries(stats.byBranch).map(([branch, count]) => (
                                <div key={branch} className="flex justify-between items-center">
                                    <span className="text-gray-700">{branch}</span>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                        {count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No data available</p>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Year-wise Distribution</h3>
                    {Object.keys(stats.byYear).length > 0 ? (
                        <div className="space-y-2">
                            {Object.entries(stats.byYear).map(([year, count]) => (
                                <div key={year} className="flex justify-between items-center">
                                    <span className="text-gray-700">{year}</span>
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                        {count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No data available</p>
                    )}
                </div>
            </div>
        </div>
    );
}
