import React, { useEffect, useState } from 'react';
import FilterPanel from '../../shared/Components/UIElements/FilterPanel';
import { useUrlFilters } from '../../shared/hooks/useUrlFilters';
import useHttp from '../../shared/hooks/http-hook';

const TeacherPerformanceView = () => {
    const [filterConfig, setFilterConfig] = useState()

    const { isLoading, error, sendRequest, setError } = useHttp()

    // Use the reusable filter hook
    const {
        filters,
        handleFilterChange,
        resetFilters,
        activeFiltersCount,
        searchParams
    } = useUrlFilters({
        academicYear: '',
        branch: '',
        teachingGroup: ''
    });

    useEffect(() => {
        const loadFilterData = async () => {
            try {
                const [academicYearsData, branchesData, teachingGroupsData] = await Promise.all([
                    sendRequest(`${import.meta.env.VITE_BACKEND_URL}/academicYears`),
                    sendRequest(`${import.meta.env.VITE_BACKEND_URL}/levels/branches`),
                    sendRequest(`${import.meta.env.VITE_BACKEND_URL}/teachingGroups`)
                ]);

                setFilterConfig({
                    academicYear: {
                        label: 'Tahun Akademik',
                        items: academicYearsData.academicYears || []
                    },
                    branch: {
                        label: 'Nama Desa',
                        items: branchesData.branches || []
                    },
                    teachingGroup: {
                        label: 'KBM',
                        items: teachingGroupsData.teachingGroups || []
                    }
                });
            } catch (err) {
                console.error('Failed to load filter data:', err);
                // Show user-friendly error message
            }
        };

        loadFilterData();
    }, [sendRequest]); // Remove 'filters' dependency

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main className="max-w-6xl mx-auto">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Teacher Performance</h1>
                    <p className="text-gray-600">Monitor and analyze teacher performance metrics</p>
                </div>

                {/* Filter Section */}
                {isLoading ? (
                    <div className="text-center py-12">Loading filters...</div>
                ) : error ? (
                    <div className="text-center py-12 text-red-600">Error: {error}</div>
                ) : (
                    <FilterPanel
                        filters={filters}
                        filterOptions={filterConfig}
                        onFilterChange={handleFilterChange}
                        onResetFilters={resetFilters}
                        activeFiltersCount={activeFiltersCount}
                        className="mb-6"
                    />
                )}

                {/* Main Content Area */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Teacher Performance Data</h3>
                        <p className="text-gray-500 mb-4">
                            {activeFiltersCount > 0
                                ? `Showing results with ${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''}`
                                : 'No filters applied - showing all data'
                            }
                        </p>
                        <div className="text-sm text-gray-400">
                            <p>Current URL parameters:</p>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {searchParams.toString() || 'No parameters'}
                            </code>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherPerformanceView;