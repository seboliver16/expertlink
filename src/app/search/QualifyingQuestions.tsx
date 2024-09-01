"use client";

import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useRouter } from 'next/navigation';
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '../UserContext';
import Project from '../models/project';

interface QualifyingQuestionsProps {
  projectStep: number;
  setProjectStep: (step: number) => void;
  projectTitle: string;
  setProjectTitle: (title: string) => void;
  questions: string[];
  setQuestions: (questions: string[]) => void;
  updateSidebar: () => void;
  selectedIndustry: string; // Receive industry
  selectedRole: string; // Receive role
  selectedCurrentCompanies: string[]; // Receive current companies
  selectedPreviousCompanies: string[]; // Receive previous companies
}

const QualifyingQuestions: React.FC<QualifyingQuestionsProps> = ({
  projectStep,
  setProjectStep,
  projectTitle,
  setProjectTitle,
  questions,
  setQuestions,
  updateSidebar,
  selectedIndustry,
  selectedRole,
  selectedCurrentCompanies,
  selectedPreviousCompanies,
}) => {
  const router = useRouter();
  const { user } = useUser(); // Now accessible if wrapped with UserProvider

  const isValidQuestion = (question: string): boolean => {
    const strippedQuestion = question.replace(/[^\w]/g, ''); // Remove punctuation and spaces
    return strippedQuestion.length >= 5;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectTitle(e.target.value);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = value;
    setQuestions(updatedQuestions);
  };

  const isFormValid = (): boolean => {
    return projectTitle.trim().length > 0;
  };

  const createProject = async () => {
  if (!user) {
    console.error("User is not available");
    return;
  }
  if (!isFormValid()) return;

  const projectId = uuidv4(); // Generate a UUID for the project ID
  const now = new Date().toISOString();

  const projectData = new Project(
    projectId,
    projectTitle,
    "Provide a detailed description here", // Replace with the actual description
    questions.filter((q) => q.trim().length > 0),
    "Open Opportunity", // Expert status
    "Pending Response", // Seeker status
    ["General"] // Categories
  );

  try {
    // Save the project to Firestore under the expert seeker’s projects
    const userProjectRef = doc(db, `projects/${user.id}/userProjects/${projectId}`);
    await setDoc(userProjectRef, { ...projectData });

    user.addProject(projectData);
    updateSidebar(); // Update the sidebar with the new project

    router.push(`/project/${projectId}`); // Navigate to the project search page
  } catch (error) {
    console.error("Error creating project: ", error);
  }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="space-y-6 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-800 text-center">Project Title & Questions</h1>
        <input
          type="text"
          value={projectTitle}
          onChange={handleTitleChange}
          placeholder="Enter Project Title (required, max 25 chars)"
          className={`block w-full border-2 rounded-lg p-4 text-lg text-gray-700 mt-4 ${
            projectTitle.trim().length > 0 ? "border-blue-500 focus:border-blue-700" : "border-red-500"
          }`}
        />
        <p className="text-sm text-gray-500 text-right">{projectTitle.length}/25</p>
        <div className="mt-6 space-y-4">
          {questions.map((question, index) => (
            <input
              key={index}
              type="text"
              value={question}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              placeholder={`#${index + 1} Qualifying Question (optional)`}
              className={`block w-full border-2 rounded-lg p-4 text-lg mt-2 ${
                question.trim().length > 0 ? "border-blue-500 focus:border-blue-700" : "border-gray-300"
              }`}
              maxLength={150}
              disabled={index > 0 && !isValidQuestion(questions[index - 1])}
            />
          ))}
          <p className="text-sm text-gray-500 text-right mt-2">Max 10 questions</p>
        </div>
        <div className="flex justify-between mt-8 gap-4">
          <button
            onClick={() => setProjectStep(projectStep - 1)}
            className="bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition shadow-lg"
            style={{ width: '200px', visibility: projectStep > 1 ? 'visible' : 'hidden' }}
          >
            Back
          </button>
          <button
            onClick={createProject}
            className={`py-3 px-6 rounded-lg transition shadow-lg ${
              isFormValid() ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            style={{ width: '200px' }}
            disabled={!isFormValid()}
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default QualifyingQuestions;
