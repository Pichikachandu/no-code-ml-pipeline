import React, { useState, useEffect } from 'react';
import api from '../api';

const ResultsStep = ({ runId, onReset, onPrev }) => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await api.get(`/api/results/${runId}`);
                setResults(response.data);
            } catch (err) {
                setError('Failed to fetch results.');
            } finally {
                setLoading(false);
            }
        };

        if (runId) {
            fetchResults();
        }
    }, [runId]);

    if (loading) {
        return (
            <div className="flex w-full flex-col items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-slate-500 dark:text-gray-400">Loading results...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex w-full flex-col items-center justify-center py-12">
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400">
                    {error}
                </div>
                <button
                    onClick={onPrev}
                    className="mt-4 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!results) return null;

    // Calculate weighted avg metrics for the summary cards if available, else use accuracy
    const weightedAvg = results.classification_report['weighted avg'];
    const precision = weightedAvg ? (weightedAvg['precision'] * 100).toFixed(1) + '%' : 'N/A';
    const f1Score = weightedAvg ? (weightedAvg['f1-score'] * 100).toFixed(1) + '%' : 'N/A';
    const accuracy = (results.accuracy * 100).toFixed(1) + '%';

    // Pagination Logic
    const reportKeys = Object.keys(results.classification_report).filter(key => key !== 'accuracy');
    const totalPages = Math.ceil(reportKeys.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentKeys = reportKeys.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="flex w-full flex-col gap-8 max-w-full px-4 sm:px-6 lg:px-8 mx-auto">
            {/* PageHeading */}
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-[#111418] dark:text-white sm:text-4xl">View Results</h1>
                <p className="mt-3 text-base text-slate-500 dark:text-gray-400">Review the performance of your trained machine learning model.</p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto w-full">
                <div className="flex flex-col gap-2 rounded-xl border border-[#dce0e5] dark:border-white/10 bg-white dark:bg-gray-800/20 p-6">
                    <div className="flex items-center gap-2">
                        <p className="text-base font-medium text-slate-700 dark:text-gray-300">Accuracy Score</p>
                        <span className="material-symbols-outlined text-sm text-slate-500 dark:text-gray-400">info</span>
                    </div>
                    <p className="text-4xl font-bold text-[#111418] dark:text-white">{accuracy}</p>
                </div>
                <div className="flex flex-col gap-2 rounded-xl border border-[#dce0e5] dark:border-white/10 bg-white dark:bg-gray-800/20 p-6">
                    <p className="text-base font-medium text-slate-700 dark:text-gray-300">Precision (Weighted)</p>
                    <p className="text-4xl font-bold text-[#111418] dark:text-white">{precision}</p>
                </div>
                <div className="flex flex-col gap-2 rounded-xl border border-[#dce0e5] dark:border-white/10 bg-white dark:bg-gray-800/20 p-6">
                    <p className="text-base font-medium text-slate-700 dark:text-gray-300">F1-Score (Weighted)</p>
                    <p className="text-4xl font-bold text-[#111418] dark:text-white">{f1Score}</p>
                </div>
            </div>

            {/* Visualization and Report Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
                {/* Confusion Matrix */}
                <div className="flex flex-col">
                    <div className="flex flex-col gap-4 rounded-xl border border-[#dce0e5] dark:border-white/10 bg-white dark:bg-gray-800/20 p-6">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-[#111418] dark:text-white">Confusion Matrix</h2>
                            <span className="material-symbols-outlined text-sm text-slate-500 dark:text-gray-400 cursor-help" title="A table that is often used to describe the performance of a classification model">info</span>
                        </div>
                        <div className="flex-grow flex items-center justify-center bg-white/5 rounded-lg overflow-hidden p-4">
                            <img
                                className="max-w-full max-h-[600px] w-auto h-auto object-contain rounded-lg"
                                src={`data:image/png;base64,${results.confusion_matrix}`}
                                alt="Confusion Matrix"
                            />
                        </div>
                    </div>
                </div>

                {/* Classification Report */}
                <div className="flex flex-col">
                    <div className="flex flex-col gap-4 rounded-xl border border-[#dce0e5] dark:border-white/10 bg-white dark:bg-gray-800/20 p-6">
                        <h2 className="text-lg font-bold text-[#111418] dark:text-white">Classification Report</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-[#dce0e5] dark:border-white/10 text-slate-600 dark:text-gray-400">
                                    <tr>
                                        <th className="py-3 pr-3 font-medium">Class</th>
                                        <th className="py-3 px-3 font-medium">Precision</th>
                                        <th className="py-3 px-3 font-medium">Recall</th>
                                        <th className="py-3 pl-3 font-medium">F1-Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#dce0e5] dark:divide-white/5 text-slate-800 dark:text-gray-200">
                                    {currentKeys.map((key) => {
                                        const row = results.classification_report[key];
                                        return (
                                            <tr key={key} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="whitespace-nowrap py-4 pr-3 font-medium capitalize">{key}</td>
                                                <td className="whitespace-nowrap px-3 py-4">{row.precision.toFixed(2)}</td>
                                                <td className="whitespace-nowrap px-3 py-4">{row.recall.toFixed(2)}</td>
                                                <td className="whitespace-nowrap pl-3 py-4">{row['f1-score'].toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-[#dce0e5] dark:border-white/10 pt-4 mt-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                                <span className="text-sm text-slate-600 dark:text-gray-400">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse items-center justify-end gap-3 border-t border-[#dce0e5] dark:border-white/10 pt-6 sm:flex-row">
                <button
                    onClick={onPrev}
                    className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20 sm:w-auto transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onReset}
                    className="flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 sm:w-auto transition-colors"
                >
                    Start New Pipeline
                </button>
            </div>
        </div>
    );
};

export default ResultsStep;
