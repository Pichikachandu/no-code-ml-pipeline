import React, { useState, useRef, useEffect } from 'react';
import api from '../api';

const PreprocessStep = ({ runId, pipelineData, onNext, onPrev }) => {
    const [selectedSteps, setSelectedSteps] = useState([]);
    const [targetColumn, setTargetColumn] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const columns = pipelineData.upload?.column_names || [];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleStepChange = (step) => {
        if (selectedSteps.includes(step)) {
            setSelectedSteps(selectedSteps.filter((s) => s !== step));
        } else {
            setSelectedSteps([...selectedSteps, step]);
        }
    };

    const handleProcess = async () => {
        if (!targetColumn) {
            setError('Please select a target column (the value you want to predict).');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await api.post('/api/preprocess', {
                run_id: runId,
                steps: selectedSteps,
                target: targetColumn,
            });
            // Pass target column to next steps
            onNext({ target: targetColumn });
        } catch (err) {
            setError(err.response?.data?.error || 'Preprocessing failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-4xl mx-auto">
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between gap-3 mb-8">
                <div className="flex flex-col gap-2">
                    <p className="text-[#111418] dark:text-white text-4xl font-black leading-tight tracking-tight">Preprocess Data</p>
                    <p className="text-slate-500 dark:text-white/60 text-base font-normal leading-normal">
                        Define your prediction target and apply scaling transformations to prepare your features.
                    </p>
                </div>
            </div>

            {/* Target Variable Section */}
            <div className="mb-12">
                <div className="flex flex-col w-full max-w-lg relative" ref={dropdownRef}>
                    <p className="text-[#111418] dark:text-white text-base font-medium leading-normal pb-2">Select Target Variable (Y)</p>

                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex w-full items-center justify-between rounded-xl border border-[#dce0e5] dark:border-white/20 bg-white dark:bg-white/5 h-14 px-4 text-base font-normal text-[#111418] dark:text-white focus:outline-none focus:border-primary transition-colors"
                    >
                        <span className={!targetColumn ? "text-slate-500 dark:text-white/60" : ""}>
                            {targetColumn || "Choose the column to predict"}
                        </span>
                        <span className={`material-symbols-outlined text-slate-500 dark:text-white/60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-xl border border-[#dce0e5] dark:border-white/20 bg-white dark:bg-[#101922] shadow-xl max-h-60 overflow-y-auto no-scrollbar">
                            {columns.map((col) => (
                                <div
                                    key={col}
                                    onClick={() => {
                                        setTargetColumn(col);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`px-4 py-3 cursor-pointer transition-colors text-[#111418] dark:text-white hover:bg-primary/10 dark:hover:bg-white/10 ${targetColumn === col ? 'bg-primary/5 dark:bg-white/5 font-medium' : ''}`}
                                >
                                    {col}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{error}</p>
                )}
            </div>

            {/* Feature Scaling Section */}
            <div>
                <h2 className="text-[#111418] dark:text-white text-[22px] font-bold leading-tight tracking-tight mb-6">Apply Feature Scaling</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Standardization Card */}
                    <label className={`relative flex cursor-pointer flex-col gap-4 rounded-xl border p-6 transition-all hover:border-primary/40 ${selectedSteps.includes('standardize')
                        ? 'border-primary bg-primary/5 dark:bg-primary/20'
                        : 'border-[#dce0e5] dark:border-white/20 bg-white dark:bg-white/5'
                        }`}>
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <h3 className="text-lg font-bold text-[#111418] dark:text-white">Standardization</h3>
                                <p className="mt-1 text-sm text-slate-500 dark:text-white/60">Rescales features to have a mean of 0 and a standard deviation of 1.</p>
                            </div>
                            <input
                                type="checkbox"
                                className="form-checkbox mt-1 h-5 w-5 shrink-0 rounded border-gray-300 dark:border-white/30 bg-white dark:bg-white/10 text-primary focus:ring-primary"
                                checked={selectedSteps.includes('standardize')}
                                onChange={() => handleStepChange('standardize')}
                            />
                        </div>
                        <span className="material-symbols-outlined absolute top-4 right-4 text-slate-400 dark:text-white/40 text-xl">info</span>
                    </label>

                    {/* Normalization Card */}
                    <label className={`relative flex cursor-pointer flex-col gap-4 rounded-xl border p-6 transition-all hover:border-primary/40 ${selectedSteps.includes('normalize')
                        ? 'border-primary bg-primary/5 dark:bg-primary/20'
                        : 'border-[#dce0e5] dark:border-white/20 bg-white dark:bg-white/5'
                        }`}>
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <h3 className="text-lg font-bold text-[#111418] dark:text-white">Normalization</h3>
                                <p className="mt-1 text-sm text-slate-500 dark:text-white/60">Scales features to a fixed range, typically between 0 and 1.</p>
                            </div>
                            <input
                                type="checkbox"
                                className="form-checkbox mt-1 h-5 w-5 shrink-0 rounded border-gray-300 dark:border-white/30 bg-white dark:bg-white/10 text-primary focus:ring-primary"
                                checked={selectedSteps.includes('normalize')}
                                onChange={() => handleStepChange('normalize')}
                            />
                        </div>
                        <span className="material-symbols-outlined absolute top-4 right-4 text-slate-400 dark:text-white/40 text-xl">info</span>
                    </label>
                </div>
            </div>

            {/* Navigation Buttons */}
            <footer className="mt-12 flex justify-end gap-4 border-t border-[#dce0e5] dark:border-white/10 py-5">
                <button
                    onClick={onPrev}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent border border-[#dce0e5] dark:border-white/30 text-[#111418] dark:text-white text-sm font-bold leading-normal tracking-wide hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                    <span className="truncate">Back</span>
                </button>
                <button
                    onClick={handleProcess}
                    disabled={loading}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="truncate">{loading ? 'Processing...' : 'Next'}</span>
                </button>
            </footer>
        </div>
    );
};

export default PreprocessStep;
