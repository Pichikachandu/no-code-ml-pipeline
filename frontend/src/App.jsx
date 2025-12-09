import React, { useState } from 'react';
import StepIndicator from './components/StepIndicator';
import UploadStep from './components/UploadStep';
import PreviewStep from './components/PreviewStep';
import PreprocessStep from './components/PreprocessStep';
import SplitStep from './components/SplitStep';
import ModelStep from './components/ModelStep';
import ResultsStep from './components/ResultsStep';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [runId, setRunId] = useState(null);
  const [pipelineData, setPipelineData] = useState({});

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const nextStep = (data = {}) => {
    setPipelineData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const resetPipeline = () => {
    setCurrentStep(1);
    setRunId(null);
    setPipelineData({});
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden font-display text-[#111418] dark:text-white">
      <div className="layout-container flex h-full grow flex-col">

        {/* Header moved outside the constrained container to be full width */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#dce0e5] dark:border-white/10 px-4 sm:px-6 md:px-10 py-3 w-full">
          <div className="flex items-center gap-4 text-[#111418] dark:text-white">
            <div className="size-6 text-primary">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Pipeline Builder</h2>
          </div>
          <div className="flex flex-1 justify-end gap-2">
            <button
              onClick={toggleTheme}
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#f0f2f4] dark:bg-white/10 text-[#111418] dark:text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <span className="material-symbols-outlined text-[#111418] dark:text-white text-xl">
                {darkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#f0f2f4] dark:bg-white/10 text-[#111418] dark:text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
              <span className="material-symbols-outlined text-[#111418] dark:text-white text-xl">notifications</span>
            </button>
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBNxy8iRTCebxrpdBoWhTa4PjFsYtt2hSRQ9nHmjvsBKHhTtpb7QSh7ZAXwMimR9c6jDd1hoTXEiuYq1yEHk5dI1mdfJa7wdmGvcJUSxVux0VNLuxXa_ojYSXa7MjkH61I77k-p3kh8HGv7J527Nqno4YWN2TyzVr3Q-M6m1YvbuD1njPxQg55KFoVoH6Vclp4GSK8rX4ghGknO98nBzabgc-aBQzrtQGEvFw834QJz_Fzyt9XdP5yI1qziuO06RY7xxYxwJc3Ibbk-")' }}></div>
          </div>
        </header>

        <div className="flex flex-1 justify-center py-5 sm:px-4 md:px-6 lg:px-8 xl:px-10">
          <div className="layout-content-container flex flex-col max-w-full flex-1">

            <main className="flex flex-col flex-1 py-10 px-4 sm:px-6 md:px-10">
              <StepIndicator currentStep={currentStep} />

              <div className="mt-8 transition-all duration-500 ease-in-out">
                {currentStep === 1 && (
                  <UploadStep onNext={nextStep} setRunId={setRunId} setPipelineData={setPipelineData} />
                )}
                {currentStep === 2 && (
                  <PreviewStep runId={runId} pipelineData={pipelineData} onNext={nextStep} onPrev={prevStep} />
                )}
                {currentStep === 3 && (
                  <PreprocessStep runId={runId} pipelineData={pipelineData} onNext={nextStep} onPrev={prevStep} />
                )}
                {currentStep === 4 && (
                  <SplitStep runId={runId} pipelineData={pipelineData} onNext={nextStep} onPrev={prevStep} />
                )}
                {currentStep === 5 && (
                  <ModelStep runId={runId} onNext={nextStep} onPrev={prevStep} />
                )}
                {currentStep === 6 && (
                  <ResultsStep runId={runId} onReset={resetPipeline} onPrev={prevStep} />
                )}
              </div>
            </main>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
