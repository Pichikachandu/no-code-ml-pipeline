import React, { useState } from 'react';
import api from '../api';

const ModelStep = ({ runId, onNext, onPrev }) => {
    const [selectedModel, setSelectedModel] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTrain = async () => {
        if (!selectedModel) {
            setError('Please select a model.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await api.post('/api/train', {
                run_id: runId,
                model: selectedModel,
            });
            onNext();
        } catch (err) {
            setError(err.response?.data?.error || 'Training failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full flex-col max-w-4xl mx-auto">
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between gap-3 mb-8">
                <div className="flex flex-col gap-2">
                    <p className="text-[#111418] dark:text-white text-4xl font-black leading-tight tracking-tight">Select a Model</p>
                    <p className="text-slate-500 dark:text-[#9dabb9] text-base font-normal leading-normal">
                        Choose the machine learning model for your pipeline.
                    </p>
                </div>
            </div>

            {/* Model Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Logistic Regression Card */}
                <div
                    onClick={() => setSelectedModel('logistic')}
                    className={`flex flex-1 cursor-pointer gap-4 rounded-xl border-2 p-6 flex-col transition-all hover:shadow-lg ${selectedModel === 'logistic'
                        ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md'
                        : 'border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-[#1c2127] hover:border-primary/50 dark:hover:border-primary/50'
                        }`}
                >
                    <span className={`material-symbols-outlined text-3xl ${selectedModel === 'logistic' ? 'text-primary' : 'text-slate-700 dark:text-white'}`}>
                        show_chart
                    </span>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight">Logistic Regression</h2>
                        <p className="text-slate-500 dark:text-[#9dabb9] text-sm font-normal leading-normal">Best for binary classification problems.</p>
                    </div>
                </div>

                {/* Decision Tree Card */}
                <div
                    onClick={() => setSelectedModel('decision-tree')}
                    className={`flex flex-1 cursor-pointer gap-4 rounded-xl border-2 p-6 flex-col transition-all hover:shadow-lg ${selectedModel === 'decision-tree'
                        ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md'
                        : 'border-[#dce0e5] dark:border-[#3b4754] bg-white dark:bg-[#1c2127] hover:border-primary/50 dark:hover:border-primary/50'
                        }`}
                >
                    <span className={`material-symbols-outlined text-3xl ${selectedModel === 'decision-tree' ? 'text-primary' : 'text-slate-700 dark:text-white'}`}>
                        account_tree
                    </span>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight">Decision Tree</h2>
                        <p className="text-slate-500 dark:text-[#9dabb9] text-sm font-normal leading-normal">Good for complex data and feature importance.</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
                    {error}
                </div>
            )}

            {/* Navigation Buttons */}
            <footer className="mt-auto flex flex-col-reverse sm:flex-row justify-end gap-4 border-t border-[#dce0e5] dark:border-white/10 py-5">
                <button
                    onClick={onPrev}
                    className="flex w-full sm:w-auto min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent border border-[#dce0e5] dark:border-white/30 text-[#111418] dark:text-white text-sm font-bold leading-normal tracking-wide hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                    <span className="truncate">Back</span>
                </button>
                <button
                    onClick={handleTrain}
                    disabled={loading || !selectedModel}
                    className="flex w-full sm:w-auto min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="truncate">{loading ? 'Training...' : 'Next'}</span>
                </button>
            </footer>
        </div>
    );
};

export default ModelStep;
