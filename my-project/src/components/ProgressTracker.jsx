import React from "react";
import { motion } from "framer-motion";
import { Check, Car, Wrench, Calendar, CheckCircle } from "lucide-react";

const steps = [
  { icon: Car, label: "Choose Car", step: 1 },
  { icon: Wrench, label: "Pick Service", step: 2 },
  { icon: Calendar, label: "Choose Time", step: 3 },
  { icon: CheckCircle, label: "Confirm", step: 4 },
];

const ProgressTracker = ({ currentStep }) => {
  return (
    <div className="w-full py-8 bg-gradient-to-r from-[#0B1315] via-[#10181A] to-[#0B1315] shadow-lg">
      <div className="flex items-center justify-between max-w-5xl mx-auto px-4 gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.step;
          const isCurrent = currentStep === step.step;

          return (
            <div key={step.step} className="flex items-center flex-1">
              {/* Step Circle */}
              <motion.div
                className="flex flex-col items-center flex-shrink-0"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.15, type: "spring" }}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isCompleted
                      ? "bg-gradient-to-br from-blue-500 to-blue-400 border-blue-500 text-white shadow-lg shadow-blue-500/40"
                      : isCurrent
                      ? "bg-gradient-to-br from-blue-600 to-blue-400 border-blue-500 text-white shadow-lg shadow-blue-500/40 scale-105"
                      : "bg-white/5 border-gray-600 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs sm:text-sm font-medium text-center tracking-wide ${
                    isCompleted || isCurrent ? "text-white" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </motion.div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center">
                  {/* Base line */}
                  <div className="h-1 w-full bg-gray-700 rounded-full relative">
                    {/* Progress fill */}
                    <motion.div
                      className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{
                        width: currentStep > step.step ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </div>
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
