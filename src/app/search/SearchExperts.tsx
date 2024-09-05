"use client";

import { useState, useEffect } from "react";
import { doc, collection, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase.config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
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
