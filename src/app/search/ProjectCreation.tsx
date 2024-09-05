"use client";

import React, { useState, useEffect } from 'react';
import NarrowAsk from './NarrowAsk';
import QualifyingQuestions from './QualifyingQuestions';
import { useUser } from '../UserContext';

interface ProjectCreationProps {
  collapsed: boolean;
  updateSidebar: () => void;
  projectId: string | null;
  reset: boolean;
}

const ProjectCreation: React.FC<ProjectCreationProps> = ({
  collapsed,
  updateSidebar,
  projectId,
  reset,
}) => {
  const [projectStep, setProjectStep] = useState(1);
  const { user } = useUser();
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [projectObjective, setProjectObjective] = useState<string>(''); // State for objective
  const [projectDescription, setProjectDescription] = useState<string>(''); // State for objective
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>(''); 
  const [selectedCurrentCompanies, setSelectedCurrentCompanies] = useState<string[]>([]);
  const [selectedPreviousCompanies, setSelectedPreviousCompanies] = useState<string[]>([]);
  const [questions, setQuestions] = useState<string[]>(Array(10).fill(''));

  useEffect(() => {
    if (reset) {
      setProjectStep(1);
      setProjectTitle('');
      setProjectObjective(''); // Reset objective
      setProjectDescription(''); 
      setSelectedRole('');
      setSelectedIndustry('');
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
          objective={projectObjective} // Pass objective as a prop
          setObjective={setProjectObjective} // Pass the setter function
          description={projectDescription}
          setDescription={setProjectDescription}
        />
      )}
      {projectStep === 2 && (
        <QualifyingQuestions
          projectStep={projectStep}
          objective={projectObjective} // Pass objective as a prop
          setProjectObjective={setProjectObjective}
          description={projectDescription} // Pass description as a prop
          setProjectDescription={setProjectDescription}
          setProjectStep={setProjectStep}
          projectTitle={projectTitle}
          setProjectTitle={setProjectTitle}
          questions={questions}
          setQuestions={setQuestions}
          updateSidebar={updateSidebar}
          selectedIndustry={selectedIndustry}
          selectedRole={selectedRole}
          selectedCurrentCompanies={selectedCurrentCompanies}
          selectedPreviousCompanies={selectedPreviousCompanies}
        />
      )}
    </div>
  );
};

export default ProjectCreation;
