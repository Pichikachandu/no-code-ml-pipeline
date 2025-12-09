import React, { useState } from 'react';
import api from '../api';

const SplitStep = ({ runId, pipelineData, onNext, onPrev }) => {
    const [testSize, setTestSize] = useState(0.2);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const trainSize = 1 - testSize;
    const trainPercent = Math.round(trainSize * 100);
    const testPercent = Math.round(testSize * 100);

    const handleSplit = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/api/split', {
                run_id: runId,
                test_size: testSize,
                target: pipelineData?.preprocess?.target || pipelineData?.target // Handle both structures if needed
            });
            onNext({ split: { test_size: testSize } });
        } catch (err) {
            setError(err.response?.data?.error || 'Splitting failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full flex-col rounded-xl border border-[#dce0e5] dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm max-w-3xl mx-auto">
            <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-[#111418] dark:text-white tracking-tight text-2xl sm:text-3xl font-bold leading-tight">Split Your Data</h1>
                    <div className="group relative">
                        <span className="material-symbols-outlined text-slate-400 dark:text-gray-500 cursor-pointer text-xl">info</span>
                        <div className="absolute bottom-full left-1/2 mb-2 w-64 -translate-x-1/2 scale-0 transform rounded-lg bg-gray-900 dark:bg-gray-700 px-3 py-2 text-center text-sm text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 pointer-events-none">
                            Splitting data prevents overfitting by testing the model on data it hasn't seen during training.
                            <svg className="absolute left-1/2 top-full h-2 w-full -translate-x-1/2 text-gray-900 dark:text-gray-700" viewBox="0 0 255 255" x="0px" xmlSpace="preserve" y="0px"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"></polygon></svg>
                        </div>
                    </div>
                </div>
                <p className="text-slate-500 dark:text-gray-400 text-base font-normal leading-normal mb-8">Adjust the slider to set the proportion of data for training and testing your model.</p>

                {/* Slider Control */}
                <div className="mb-8">
                    <div className="relative flex w-full flex-col items-start justify-between gap-4 p-4 rounded-lg bg-[#f0f2f4] dark:bg-background-dark">
                        <div className="flex w-full shrink-[3] items-center justify-between">
                            <p className="text-[#111418] dark:text-white text-base font-medium leading-normal">Train/Test Split Ratio</p>
                            <p className="text-primary text-lg font-bold leading-normal">{trainPercent}% / {testPercent}%</p>
                        </div>
                        <div className="flex h-4 w-full items-center gap-4 relative">
                            {/* Custom Slider Visuals */}
                            <div className="flex h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 relative overflow-visible">
                                <div
                                    className="h-full rounded-full bg-primary absolute top-0 left-0"
                                    style={{ width: `${trainPercent}%` }}
                                ></div>
                                {/* Thumb */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full bg-primary ring-4 ring-primary/20 pointer-events-none"
                                    style={{ left: `calc(${trainPercent}% - 12px)` }}
                                >
                                    <div className="size-2 rounded-full bg-white"></div>
                                </div>
                            </div>

                            {/* Actual Range Input (Invisible but interactive) */}
                            <input
                                type="range"
                                min="0.1"
                                max="0.9"
                                step="0.05"
                                value={trainSize} // Slider controls train size naturally left-to-right
                                onChange={(e) => setTestSize(1 - parseFloat(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                        </div>
                    </div>
                </div>

                {/* Data Representation */}
                <div className="p-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-4">
                    <div className="col-span-2 grid grid-cols-subgrid border-t border-[#dce0e5] dark:border-gray-700 pt-5">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                            <p className="text-slate-500 dark:text-gray-400 text-sm font-normal leading-normal">Training Data</p>
                        </div>
                        <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal justify-self-end">{trainPercent}%</p>
                    </div>
                    <div className="col-span-2 grid grid-cols-subgrid border-t border-[#dce0e5] dark:border-gray-700 py-5">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                            <p className="text-slate-500 dark:text-gray-400 text-sm font-normal leading-normal">Testing Data</p>
                        </div>
                        <p className="text-[#111418] dark:text-white text-sm font-medium leading-normal justify-self-end">{testPercent}%</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between border-t border-[#dce0e5] dark:border-gray-700 bg-gray-50 dark:bg-gray-800/20 px-6 py-4 rounded-b-xl">
                <button
                    onClick={onPrev}
                    className="flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                    Back
                </button>
                <button
                    onClick={handleSplit}
                    disabled={loading}
                    className="flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Splitting...' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default SplitStep;
