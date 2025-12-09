import React from 'react';

const StepIndicator = ({ currentStep }) => {
    // Map internal steps (1-6) to visual steps (1-5)
    // 1 (Upload), 2 (Preview) -> Visual 1 (Dataset Upload)
    // 3 (Preprocess) -> Visual 2 (Data Preprocessing)
    // 4 (Split) -> Visual 3 (Train-Test Split)
    // 5 (Model) -> Visual 4 (Model Selection)
    // 6 (Results) -> Visual 5 (Model Output & Results)

    let visualCurrentStep = 1;
    if (currentStep <= 2) visualCurrentStep = 1;
    else if (currentStep === 3) visualCurrentStep = 2;
    else if (currentStep === 4) visualCurrentStep = 3;
    else if (currentStep === 5) visualCurrentStep = 4;
    else visualCurrentStep = 5;

    const steps = [
        { id: 1, label: 'Dataset Upload' },
        { id: 2, label: 'Data Preprocessing' },
        { id: 3, label: 'Train-Test Split' },
        { id: 4, label: 'Model Selection' },
        { id: 5, label: 'Model Output & Results' },
    ];

    return (
        <div className="flex items-center justify-center mb-8 flex-wrap gap-y-4">
            {steps.map((step, index) => {
                const isCompleted = step.id < visualCurrentStep;
                const isActive = step.id === visualCurrentStep;

                // Base classes for the pill container
                const containerBase = "flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full pl-2 pr-4 transition-all duration-300 border border-transparent";

                // State-specific styling
                let containerStyle = "";
                let circleStyle = "";
                let textStyle = "";
                let iconContent = null;

                if (isActive || isCompleted) {
                    // Active or Completed: Primary Background
                    containerStyle = "bg-primary border-primary";
                    circleStyle = "bg-white text-primary";
                    textStyle = "text-white";

                    // Show checkmark if completed OR if it's the last step and active (pipeline finished)
                    if (isCompleted || (isActive && step.id === steps.length)) {
                        iconContent = <span className="material-symbols-outlined text-base font-bold">check</span>;
                    } else {
                        iconContent = <span className="text-xs font-bold">{step.id}</span>;
                    }
                } else {
                    // Pending: Light/Dark transparent background
                    containerStyle = "bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/5";
                    circleStyle = "bg-gray-200 dark:bg-white/20 text-gray-500 dark:text-white/60";
                    textStyle = "text-gray-500 dark:text-white/60";
                    iconContent = <span className="text-xs font-bold">{step.id}</span>;
                }

                return (
                    <React.Fragment key={step.id}>
                        <div className={`${containerBase} ${containerStyle}`}>
                            <div className={`flex items-center justify-center size-5 rounded-full ${circleStyle}`}>
                                {iconContent}
                            </div>
                            <p className={`text-sm font-medium leading-normal ${textStyle}`}>
                                {step.label}
                            </p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="px-4 flex items-center">
                                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 animate-fade-slide text-xl">
                                    arrow_forward
                                </span>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default StepIndicator;
