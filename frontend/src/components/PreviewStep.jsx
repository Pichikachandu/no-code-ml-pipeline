import React, { useState, useEffect } from 'react';
import api from '../api';

const PreviewStep = ({ runId, pipelineData, onNext, onPrev }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/api/preview/${runId}?page=${page}&limit=${limit}`);
                setData(response.data.preview);
                setTotalPages(response.data.total_pages);
            } catch (err) {
                setError('Failed to load data preview.');
            } finally {
                setLoading(false);
            }
        };

        if (runId) {
            fetchData();
        }
    }, [runId, page]);

    if (loading && page === 1) return <div className="text-center py-10 text-[#111418] dark:text-white">Loading preview...</div>;
    if (error) return <div className="text-center py-10 text-red-600 dark:text-red-400">{error}</div>;

    if (data.length === 0) return <div className="text-center py-10 text-[#111418] dark:text-white">No data available.</div>;

    const columns = Object.keys(data[0]);

    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">


            {/* Page Heading */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
                <div className="flex flex-col gap-3">
                    <p className="text-[#111418] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Preview Your Data</p>
                    <p className="text-slate-500 dark:text-[#9dabb9] text-base font-normal leading-normal max-w-2xl">
                        Review a sample of your dataset to ensure it was uploaded correctly. Verify the columns and data types before proceeding.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 p-4">
                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-[#111418]">
                    <p className="text-[#111418] dark:text-white text-base font-medium leading-normal">Total Rows</p>
                    <p className="text-[#111418] dark:text-white tracking-light text-2xl font-bold leading-tight">
                        {pipelineData?.upload?.rows || 'N/A'}
                    </p>
                </div>
                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-[#111418]">
                    <p className="text-[#111418] dark:text-white text-base font-medium leading-normal">Total Columns</p>
                    <p className="text-[#111418] dark:text-white tracking-light text-2xl font-bold leading-tight">
                        {pipelineData?.upload?.columns || columns.length}
                    </p>
                </div>
            </div>

            {/* Table Section */}
            <div className="flex flex-col gap-4 p-4">
                <div className="flex overflow-hidden rounded-lg border border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-[#111418]">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#f0f2f4] dark:bg-[#1c2127]">
                                    {columns.map((col) => (
                                        <th key={col} className="px-4 py-3 text-[#111418] dark:text-white text-sm font-medium leading-normal whitespace-nowrap">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, idx) => (
                                    <tr key={idx} className="border-t border-t-[#dce0e5] dark:border-t-[#3b4754] hover:bg-[#f0f2f4] dark:hover:bg-[#1c2127]/50 transition-colors">
                                        {columns.map((col) => (
                                            <td key={`${idx}-${col}`} className="h-[72px] px-4 py-2 text-[#111418] dark:text-[#9dabb9] text-sm font-normal leading-normal whitespace-nowrap">
                                                {row[col]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-[#111418] dark:text-gray-300 border border-[#dce0e5] dark:border-gray-600 hover:bg-[#f0f2f4] dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Previous
                </button>
                <span className="text-sm text-[#637588] dark:text-gray-400">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                    className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-[#111418] dark:text-gray-300 border border-[#dce0e5] dark:border-gray-600 hover:bg-[#f0f2f4] dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
            </div>

            {/* Wizard Navigation Bar */}
            <div className="flex flex-wrap justify-between gap-4 p-4 mt-8 border-t border-[#dce0e5] dark:border-gray-700">
                <button
                    onClick={onPrev}
                    className="rounded-lg px-6 py-3 text-base font-medium text-[#111418] dark:text-gray-300 bg-[#f0f2f4] dark:bg-gray-700 hover:bg-[#e1e4e8] dark:hover:bg-gray-600 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90 transition-colors shadow-md"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default PreviewStep;
