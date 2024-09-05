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
  setProjectObjective: (objective: string) => void; // Fix: Make sure the prop is correctly defined
  questions: string[];
  objective: string;
  description: string;
  setProjectDescription: (objective: string) => void; // Fix: Make sure the prop is correctly defined
  setQuestions: (questions: string[]) => void;
  updateSidebar: () => void;
  selectedIndustry: string;
  selectedRole: string;
  selectedCurrentCompanies: string[];
  selectedPreviousCompanies: string[];
}

const QualifyingQuestions: React.FC<QualifyingQuestionsProps> = ({
  projectStep,
  setProjectStep,
  projectTitle,
  setProjectTitle,
  setProjectObjective,
  setProjectDescription,
  questions,
  objective, // Make sure the objective is passed as a prop
  description,
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

  const handleObjectiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectObjective(e.target.value); // Fix: Properly update the objective
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectDescription(e.target.value); // Fix: Properly update the objective
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = value;
    setQuestions(updatedQuestions);
  };

  const isFormValid = (): boolean => {
    return projectTitle.trim().length > 0 && objective.trim().length > 0; // Fix: Ensure objective is included in validation
  };

  const createProject = async () => {
    if (!user) {
      console.error("User is not available");
      return;
    }

    if (!isFormValid()) return;

    const projectId = uuidv4(); // Generate a UUID for the project ID

    const askingPrice = 0; // Replace with the actual asking price from your form
    const availability = [""]; // Replace with actual availability from your form

    const expertStatus = new Map<string, string>();
    const seekerStatus = new Map<string, string>();

    expertStatus.set("exampleExpertId", "Open Opportunity");
    seekerStatus.set("exampleSeekerId", "Pending Response");

    const projectData = new Project(
      projectId,
      projectTitle,
      description,
      objective, // Use the passed objective here
      questions.filter((q) => q.trim().length > 0),
      expertStatus,
      seekerStatus,
      ["General"],
      askingPrice,
      availability
    );

    try {
      const projectDataForFirestore = {
        ...projectData,
        expertStatus: Object.fromEntries(expertStatus),
        seekerStatus: Object.fromEntries(seekerStatus),
      };

      const userProjectRef = doc(db, `projects/${user.id}/userProjects/${projectId}`);
      await setDoc(userProjectRef, projectDataForFirestore);

      user.addProject(projectData);
      updateSidebar();

      router.push(`/project/${projectId}`);
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
