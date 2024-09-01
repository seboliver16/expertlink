"use client";

import { useState, useEffect } from "react";
import { doc, collection, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase.config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import User from "../models/User";
import { useUser } from "../UserContext";
import Project from "../models/project";

interface SearchExpertsProps {
  projectStep: number;
  setProjectStep: (step: number) => void;
  projectTitle: string;
  selectedRole: string;
  selectedCurrentCompanies: string[];
  selectedPreviousCompanies: string[];
  questions: string[];
}

const SearchExperts: React.FC<SearchExpertsProps> = ({
  projectStep,
  setProjectStep,
  projectTitle,
  selectedRole,
  selectedCurrentCompanies,
  selectedPreviousCompanies,
  questions,
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useUser(); // Now accessible if wrapped with UserProvider
  const projectID = doc(collection(db, 'projects')).id;

  const handleProjectCreation = async () => {
    if (!user) {
      console.error("User is not available");
      return;
    }

    setLoading(true);

    try {
      // Use a credit for project creation
      user.useCredit();

      // Create a new Project instance
      const project = new Project(
        projectID,
        projectTitle,
        `A project regarding the role: ${selectedRole}`, // Description placeholder
        questions,
        "Open Opportunity", // Expert status
        "Pending Response", // Seeker status
        ["General"] // Categories can be set more dynamically if needed
      );

      // Save the project to the general collection
      await setDoc(doc(db, 'projects', projectID), {
        ...project,
        timestamp: new Date(), // Ensure timestamp is saved in the Firestore document
      });

      // Add the project to the user's collection with the title
      await setDoc(doc(db, 'users', user.id, 'userProjects', projectID), {
        projectID,
        title: projectTitle,
        timestamp: new Date(),
      });

      // Update user's project map and credits
      user.addProject(project);
      await updateDoc(doc(db, 'users', user.id), {
        credits: increment(-1),
        [`projects.${projectID}`]: projectTitle,
      });

      setProjectStep(projectStep + 1);
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleProjectCreation();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      {loading && (
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-600" />
          <p className="mt-4 text-xl font-semibold text-gray-700">Creating your project...</p>
        </div>
      )}
    </div>
  );
};

export default SearchExperts;
