"use client";

import React, { useState, useEffect } from 'react';
import NarrowAsk from './NarrowAsk';
import QualifyingQuestions from './QualifyingQuestions';
import SearchExperts from './SearchExperts';
import { useUser } from '../UserContext';

interface ProjectCreationProps {
  collapsed: boolean;
  updateSidebar: () => void;
  projectId: string | null;  // Add the projectId prop
  reset: boolean;
}

const ProjectCreation: React.FC<ProjectCreationProps> = ({
  collapsed,
  updateSidebar,
  projectId,
  reset,
}) => {
  const [projectStep, setProjectStep] = useState(1);
  const { user } = useUser(); // Now accessible if wrapped with UserProvider
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>(''); // Add industry state
  const [selectedCurrentCompanies, setSelectedCurrentCompanies] = useState<string[]>([]);
  const [selectedPreviousCompanies, setSelectedPreviousCompanies] = useState<string[]>([]);
  const [questions, setQuestions] = useState<string[]>(Array(10).fill(''));

  useEffect(() => {
    if (reset) {
      setProjectStep(1);
      setProjectTitle('');
      setSelectedRole('');
      setSelectedIndustry(''); // Reset industry
      setSelectedCurrentCompanies([]);
      setSelectedPreviousCompanies([]);
      setQuestions(Array(10).fill(''));
    }
  }, [reset]);

  return (
    <div style={{ marginLeft: collapsed ? '0rem' : '4rem', transition: 'margin-left 0.3s ease', padding: projectStep === 2 ? '24px' : '0px' }}>
      {projectStep === 1 && (
        <NarrowAsk
  projectStep={projectStep}
  setProjectStep={setProjectStep}
  selectedIndustry={selectedIndustry} // Pass industry
  setSelectedIndustry={setSelectedIndustry} // Pass industry setter
  selectedRole={selectedRole}
  setSelectedRole={setSelectedRole}
  selectedCurrentCompanies={selectedCurrentCompanies}
  setSelectedCurrentCompanies={setSelectedCurrentCompanies}
  selectedPreviousCompanies={selectedPreviousCompanies}
  setSelectedPreviousCompanies={setSelectedPreviousCompanies}
/>
      )}
      {projectStep === 2 && (
        <QualifyingQuestions
    projectStep={projectStep}
    setProjectStep={setProjectStep}
    projectTitle={projectTitle}
    setProjectTitle={setProjectTitle}
    questions={questions}
    setQuestions={setQuestions}
    updateSidebar={updateSidebar}
    selectedIndustry={selectedIndustry} // Pass industry
    selectedRole={selectedRole} // Pass role
    selectedCurrentCompanies={selectedCurrentCompanies} // Pass current companies
    selectedPreviousCompanies={selectedPreviousCompanies} // Pass previous companies
  />
      )}
      
    </div>
  );
};

export default ProjectCreation;
