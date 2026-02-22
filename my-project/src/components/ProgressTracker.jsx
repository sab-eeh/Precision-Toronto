import React from "react";
import { motion } from "framer-motion";
import { Check, Car, Wrench, Calendar, CheckCircle } from "lucide-react";

const steps = [
  { icon: Car, label: "Choose Car", step: 1 },
  { icon: Wrench, label: "Pick Service", step: 2 },
  { icon: Calendar, label: "Choose Time", step: 3 },
  { icon: CheckCircle, label: "Confirm", step: 4 },
];

const ProgressTracker = ({ currentStep = 1 }) => {
  return (
    <div className="w-full py-8 bg-gradient-to-r from-[#0B1315] via-[#10181A] to-[#0B1315]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.step;
            const isCurrent = currentStep === step.step;

            return (
              <div
                key={step.step}
                className="flex flex-col items-center relative flex-1"
              >
                {/* ICON */}
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-center 
                    w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 
                    rounded-full border-2 z-10 transition-all
                    ${
                      isCompleted
                        ? "bg-blue-500 border-blue-500 text-white"
                        : isCurrent
                        ? "bg-blue-600 border-blue-400 text-white scale-105"
                        : "bg-[#0F172A] border-gray-600 text-gray-400"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  ) : (
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  )}
                </motion.div>

                {/* LABEL */}
                <span
                  className={`mt-2 text-[10px] sm:text-xs md:text-sm text-center ${
                    isCompleted || isCurrent ? "text-white" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>

                {/* 🔥 CONNECTOR LINE */}
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 -mt-2 left-1/2 w-full h-[3px] -translate-y-1/2 z-0">
                    {/* BASE LINE */}
                    <div className="w-full h-full bg-gray-700 rounded-full" />

                    {/* ACTIVE LINE */}
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{
                        width: currentStep > step.step ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
