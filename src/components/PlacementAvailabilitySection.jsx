'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function PlacementAvailabilitySection() {
    const [availableForPlacement, setAvailableForPlacement] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchAvailabilityStatus();
    }, []);

    const fetchAvailabilityStatus = async () => {
        try {
            const response = await fetch('/api/student/placement-availability');
            const data = await response.json();

            if (response.ok) {
                setAvailableForPlacement(data.data.availableForPlacement);
                setLastUpdated(data.data.placementAvailabilityUpdatedAt);
            } else {
                toast.error(data.message || 'Failed to fetch placement availability status');
            }
        } catch (error) {
            console.error('Error fetching placement availability:', error);
            toast.error('An error occurred while fetching your placement availability status');
        } finally {
            setLoading(false);
        }
    };

    const updateAvailabilityStatus = async (newStatus) => {
        setUpdating(true);
        try {
            const response = await fetch('/api/student/placement-availability', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ availableForPlacement: newStatus }),
            });

            const data = await response.json();

            if (response.ok) {
                setAvailableForPlacement(data.data.availableForPlacement);
                setLastUpdated(data.data.placementAvailabilityUpdatedAt);
                toast.success(data.message);
            } else {
                toast.error(data.message || 'Failed to update placement availability');
            }
        } catch (error) {
            console.error('Error updating placement availability:', error);
            toast.error('An error occurred while updating your placement availability');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-600">Loading placement availability status...</p>
            </div>
        );
    }

    return (
        <div className="text-center mt-5 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Placement Season Availability</h3>
            
            <div className="mb-4">
                <p className="text-gray-600 mb-2">
                    Current Status: 
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        availableForPlacement 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                    }`}>
                        {availableForPlacement ? 'Available for Placement' : 'Not Available'}
                    </span>
                </p>
                
                {lastUpdated && (
                    <p className="text-xs text-gray-500">
                        Last updated: {new Date(lastUpdated).toLocaleDateString()} at {new Date(lastUpdated).toLocaleTimeString()}
                    </p>
                )}
            </div>

            <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                    {availableForPlacement 
                        ? "You are currently marked as available for the placement season. Companies and recruiters can see your profile."
                        : "Mark yourself as available to be visible to recruiters and companies for the current placement season."
                    }
                </p>

                <div className="flex justify-center space-x-3">
                    {!availableForPlacement ? (
                        <button
                            onClick={() => updateAvailabilityStatus(true)}
                            disabled={updating}
                            className={`px-6 py-2 bg-green-600 text-white font-medium rounded-lg transition-all duration-300 ${
                                updating 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-green-700 hover:shadow-md'
                            }`}
                        >
                            {updating ? 'Updating...' : 'Mark Available for Placement'}
                        </button>
                    ) : (
                        <button
                            onClick={() => updateAvailabilityStatus(false)}
                            disabled={updating}
                            className={`px-6 py-2 bg-orange-600 text-white font-medium rounded-lg transition-all duration-300 ${
                                updating 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-orange-700 hover:shadow-md'
                            }`}
                        >
                            {updating ? 'Updating...' : 'Remove from Placement Pool'}
                        </button>
                    )}
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                        <strong>Note:</strong> Only students with completed profiles can mark themselves as available. 
                        Your availability status helps the placement cell and recruiters identify interested candidates.
                    </p>
                </div>
            </div>
        </div>
    );
}
