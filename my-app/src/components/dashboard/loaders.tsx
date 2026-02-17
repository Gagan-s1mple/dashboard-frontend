/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export const SequentialLoader = () => {
  const messages = [
    "Preparing dashboard...",
    "Loading data...",
    "Almost there...",
    "Please wait ⏳",
  ];
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p className="text-slate-500 text-sm font-medium">{messages[step]}</p>
    </div>
  );
};

export const RotatingTextLoader = () => {
  const texts = [
    "Thinking...",
    "Generating response...",
    "Analyzing data...",
    "Please Wait...",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % texts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="text-md italic text-gray-600"
    >
      {texts[step]}
    </motion.div>
  );
};

export const ThinkingIndicator = () => {
  return (
    <div className="inline-block rounded-2xl px-5 py-3">
      <div className="flex items-center gap-2 italic text-gray-600">
        <div className="text-emerald-400">
          <Brain className="w-5 h-5" />
        </div>
        <RotatingTextLoader />
      </div>
    </div>
  );
};