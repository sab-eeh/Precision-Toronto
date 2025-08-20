import React from "react";
import { Check, Car, Wrench, Calendar, CheckCircle } from "lucide-react";

const steps = [
  { icon: Car, label: "Choose Car", step: 1 },
  { icon: Wrench, label: "Pick Service", step: 2 },
  { icon: Calendar, label: "Choose Time", step: 3 },
  { icon: CheckCircle, label: "Confirm", step: 4 },
];

const ProgressTracker = ({ currentStep }) => {
  return (
    <div className="w-full py-6 bg-gray-900 shadow-lg">
      <div className="flex sm:flex-row items-center justify-between max-w-4xl mx-auto px-4 gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.step;
          const isCurrent = currentStep === step.step;

          return (
            <div key={step.step} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isCompleted
                      ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/50"
                      : isCurrent
                      ? "bg-blue-500 border-blue-500 text-white shadow-lg"
                      : "bg-gray-700 border-gray-600 text-gray-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <span
                  className={`mt-2 text-sm font-medium text-center ${
                    isCompleted || isCurrent ? "text-white" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden sm:block flex-1 h-1 mx-2 relative">
                  <div className="absolute inset-0 bg-gray-600 rounded-full"></div>
                  <div
                    className={`absolute inset-0 bg-blue-500 rounded-full transition-all duration-500 ease-in-out`}
                    style={{ width: currentStep > step.step ? "100%" : "0%" }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
