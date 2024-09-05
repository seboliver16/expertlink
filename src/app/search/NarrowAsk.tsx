"use client";

import React, { useState } from "react";

interface NarrowAskProps {
  projectStep: number;
  setProjectStep: React.Dispatch<React.SetStateAction<number>>;
  objective: string; // Receive objective as a prop
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>; // Setter for objective
  setObjective: React.Dispatch<React.SetStateAction<string>>; // Setter for objective
}

const NarrowAsk: React.FC<NarrowAskProps> = ({ projectStep, setProjectStep, objective, setObjective, description, setDescription }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNextStep = () => {
    if (objective.length < 50 || description.length < 50) {
      setErrorMessage("Both fields must meet the minimum character requirements.");
      return;
    }
    setErrorMessage(null);
    setProjectStep(projectStep + 1);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-12">
      <div className="w-[90vw] max-w-3xl">
        <h1 className="text-5xl font-extrabold text-gray-900 text-center mb-10">
          Start a Project
        </h1>

        <div className="grid grid-cols-2 gap-16">
          <div>
            <label className="block text-left text-gray-700 mb-2 text-xl font-semibold">
              Ideal Candidate
            </label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)} // Use setObjective prop
              placeholder="This will help us match you to the right experts"
              className="w-full bg-white border-2 border-gray-300 focus:border-blue-600 focus:ring-0 focus:outline-none rounded-lg p-5 text-gray-900 text-lg resize-none transition duration-300 ease-in-out"
              rows={8}
              minLength={50}
              style={{
                borderColor: "#E0E0E0",
                boxShadow: "0px 0px 0px 2px rgba(0, 0, 255, 0) inset",
                transition: "box-shadow 0.3s ease-in-out",
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = "0px 0px 0px 2px rgba(0, 0, 255, 0.5) inset";
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = "0px 0px 0px 2px rgba(0, 0, 255, 0) inset";
              }}
            />
            <p className="text-gray-500 text-sm mt-1">Minimum 50 characters</p>
          </div>

          <div>
            <label className="block text-left text-gray-700 mb-2 text-xl font-semibold">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter the project description (for experts understanding)"
              className="w-full bg-white border-2 border-gray-300 focus:border-blue-600 focus:ring-0 focus:outline-none rounded-lg p-5 text-gray-900 text-lg resize-none transition duration-300 ease-in-out"
              rows={8}
              minLength={150}
              style={{
                borderColor: "#E0E0E0",
                boxShadow: "0px 0px 0px 2px rgba(0, 0, 255, 0) inset",
                transition: "box-shadow 0.3s ease-in-out",
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = "0px 0px 0px 2px rgba(0, 0, 255, 0.5) inset";
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = "0px 0px 0px 2px rgba(0, 0, 255, 0) inset";
              }}
            />
            <p className="text-gray-500 text-sm mt-1">Minimum 50 characters</p>
          </div>
        </div>

        {errorMessage && (
          <div className="text-red-500 text-center text-lg mt-4">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-center mt-10">
          {projectStep > 1 && (
            <button
              onClick={() => setProjectStep(projectStep - 1)}
              className="text-gray-700 border-2 border-gray-700 py-3 px-10 rounded-full hover:bg-gray-100 transition duration-300 ease-in-out"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNextStep}
            className="text-blue-600 border-2 border-blue-600 py-3 px-10 rounded-full hover:bg-blue-50 transition duration-300 ease-in-out w-[75%] mt-4"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default NarrowAsk;
