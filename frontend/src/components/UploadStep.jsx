import React, { useState } from 'react';
import api from '../api';

const UploadStep = ({ onNext, setRunId, setPipelineData }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const response = await api.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setRunId(response.data.run_id);
            setPipelineData((prev) => ({ ...prev, upload: response.data }));
            onNext();
        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-[960px] mx-auto">
            <div className="flex flex-wrap justify-between gap-3 p-4">
                <div className="flex min-w-72 flex-col gap-3">
                    <p className="text-[#111418] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Upload Data</p>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">Upload your dataset to get started.</p>
                </div>
            </div>

            <div className="flex flex-col p-4">
                <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#dce0e5] dark:border-white/20 px-6 py-14 bg-white dark:bg-white/5">
                    <div className="flex items-center justify-center size-16 bg-primary/20 rounded-full">
                        <span className="material-symbols-outlined text-primary text-4xl">upload_file</span>
                    </div>
                    <div className="flex max-w-[480px] flex-col items-center gap-2">
                        <p className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">Drag & drop your file here or browse files</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal max-w-[480px] text-center">Supported file types: CSV, XLS. Maximum file size: 100MB.</p>
                    </div>
                    <label className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#f0f2f4] dark:bg-white/10 text-[#111418] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#e1e4e8] dark:hover:bg-white/20 transition-colors">
                        <span className="truncate">Select from computer</span>
                        <input type="file" className="hidden" onChange={handleFileChange} accept=".csv, .xls, .xlsx" />
                    </label>
                    {file && (
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium text-center">
                            Selected: {file.name}
                        </p>
                    )}
                </div>
            </div>

            {error && (
                <div className="mx-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
                    {error}
                </div>
            )}

            <div className="flex justify-stretch">
                <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-end border-t border-solid border-[#dce0e5] dark:border-white/10">
                    <button
                        onClick={handleUpload}
                        disabled={loading || !file}
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    >
                        <span className="truncate">{loading ? 'Uploading...' : 'Next'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadStep;
