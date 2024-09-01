"use client";

import React, { useState, useRef, useEffect } from 'react';

const roles = ["Software Engineer", "Data Scientist", "Product Manager", "UX Designer"];
const companies = ["Google", "Microsoft", "Apple", "Amazon", "Facebook"];
const industries = ["Technology", "Finance", "Healthcare", "Education"]; // Add industries

const MAX_COMPANIES = 3;

interface NarrowAskProps {
  projectStep: number;
  setProjectStep: React.Dispatch<React.SetStateAction<number>>;
  selectedRole: string;
  setSelectedRole: React.Dispatch<React.SetStateAction<string>>;
  selectedIndustry: string;  // Include industry in the props
  setSelectedIndustry: React.Dispatch<React.SetStateAction<string>>; // Handler for industry
  selectedCurrentCompanies: string[];
  setSelectedCurrentCompanies: React.Dispatch<React.SetStateAction<string[]>>;
  selectedPreviousCompanies: string[];
  setSelectedPreviousCompanies: React.Dispatch<React.SetStateAction<string[]>>;
}

const NarrowAsk: React.FC<NarrowAskProps> = ({
  projectStep,
  setProjectStep,
  selectedRole,
  setSelectedRole,
  selectedIndustry,
  setSelectedIndustry,
  selectedCurrentCompanies,
  setSelectedCurrentCompanies,
  selectedPreviousCompanies,
  setSelectedPreviousCompanies,
}) => {
  const [companySearchInput, setCompanySearchInput] = useState('');
  const [previousCompanySearchInput, setPreviousCompanySearchInput] = useState('');
  const [showCurrentCompanyOptions, setShowCurrentCompanyOptions] = useState(false);
  const [showPreviousCompanyOptions, setShowPreviousCompanyOptions] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentCompanyRef = useRef<HTMLDivElement>(null);
  const previousCompanyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currentCompanyRef.current && !currentCompanyRef.current.contains(event.target as Node)) {
        setShowCurrentCompanyOptions(false);
      }
      if (previousCompanyRef.current && !previousCompanyRef.current.contains(event.target as Node)) {
        setShowPreviousCompanyOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedIndustry(e.target.value);
  };

  const handleCompanyInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setSearchInput: React.Dispatch<React.SetStateAction<string>>,
    setShowOptions: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setSearchInput(e.target.value);
    setShowOptions(true);
  };

  const handleCompanySelect = (
    company: string,
    selectedItems: string[],
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>,
    setSearchInput: React.Dispatch<React.SetStateAction<string>>,
    setShowOptions: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (selectedItems.length >= MAX_COMPANIES) {
      setErrorMessage(`You can only add up to ${MAX_COMPANIES} companies.`);
      setShowOptions(false);
      return;
    }

    if (!selectedItems.includes(company)) {
      setSelectedItems((prevItems) => [...prevItems, company]);
      setSearchInput('');
      setErrorMessage(null); // Clear the error message when a company is added
    }
  };

  const handleRemoveChip = (
    chip: string,
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelectedItems((prevItems) => prevItems.filter((item) => item !== chip));
    setErrorMessage(null); // Clear the error message when a company is removed
  };

  const handleNextStep = () => {
    setProjectStep(projectStep + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
      <div className="space-y-4 flex flex-col justify-center items-center w-full max-w-5xl text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">Project Details</h1>
        <div className="text-lg text-gray-600 flex flex-wrap justify-center items-center gap-2 text-center">
          <span>I am looking for </span>
          <select
            value={selectedRole}
            onChange={handleRoleChange}
            className="border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none text-center text-gray-400"
            style={{ minWidth: '200px', padding: '5px' }}
          >
            <option value="" disabled hidden>Select a role</option>
            {roles.map((roleOption) => (
              <option key={roleOption} value={roleOption} className="text-black">
                {roleOption}
              </option>
            ))}
          </select>
          <span> experts in </span>
          <select
            value={selectedIndustry}
            onChange={handleIndustryChange}
            className="border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none text-center text-gray-400"
            style={{ minWidth: '200px', padding: '5px' }}
          >
            <option value="" disabled hidden>Select an industry</option>
            {industries.map((industryOption) => (
              <option key={industryOption} value={industryOption} className="text-black">
                {industryOption}
              </option>
            ))}
          </select>
          <span> industry who currently work at </span>
          <div className="relative inline-block align-top" style={{ width: '150px' }} ref={currentCompanyRef}>
            <div className="border-b-2 border-gray-300 focus-within:border-blue-500">
              <input
                type="text"
                value={companySearchInput}
                onChange={(e) => handleCompanyInputChange(e, setCompanySearchInput, setShowCurrentCompanyOptions)}
                onFocus={() => setShowCurrentCompanyOptions(true)}
                placeholder={selectedCurrentCompanies.length > 0 ? `${selectedCurrentCompanies.length} Compan${selectedCurrentCompanies.length > 1 ? 'ies' : 'y'}` : 'Any company'}
                className="border-none focus:outline-none text-gray-400 w-full px-2 py-1"
              />
            </div>
            {showCurrentCompanyOptions && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg">
                {selectedCurrentCompanies.length > 0 && (
                  <div className="flex flex-wrap gap-1 p-2">
                    {selectedCurrentCompanies.map((chip) => (
                      <div
                        key={chip}
                        className="flex items-center text-xs border border-blue-500 text-blue-500 px-2 py-0.5 rounded-full bg-white"
                      >
                        <span>{chip}</span>
                        <button
                          onClick={() => handleRemoveChip(chip, setSelectedCurrentCompanies)}
                          className="ml-1 text-red-500 font-bold"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {companies
                  .filter((company) => company.toLowerCase().includes(companySearchInput.toLowerCase()))
                  .map((company) => (
                    <div
                      key={company}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleCompanySelect(company, selectedCurrentCompanies, setSelectedCurrentCompanies, setCompanySearchInput, setShowCurrentCompanyOptions)}
                    >
                      {company}
                    </div>
                  ))}
              </div>
            )}
          </div>
          <span> and who have worked for </span>
          <div className="relative inline-block align-top" style={{ width: '150px' }} ref={previousCompanyRef}>
            <div className="border-b-2 border-gray-300 focus-within:border-blue-500">
              <input
                type="text"
                value={previousCompanySearchInput}
                onChange={(e) => handleCompanyInputChange(e, setPreviousCompanySearchInput, setShowPreviousCompanyOptions)}
                onFocus={() => setShowPreviousCompanyOptions(true)}
                placeholder={selectedPreviousCompanies.length > 0 ? `${selectedPreviousCompanies.length} Compan${selectedPreviousCompanies.length > 1 ? 'ies' : 'y'}` : 'Any company'}
                className="border-none focus:outline-none text-gray-400 w-full px-2 py-1"
              />
            </div>
            {showPreviousCompanyOptions && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg">
                {selectedPreviousCompanies.length > 0 && (
                  <div className="flex flex-wrap gap-1 p-2">
                    {selectedPreviousCompanies.map((chip) => (
                      <div
                        key={chip}
                        className="flex items-center text-xs border border-blue-500 text-blue-500 px-2 py-0.5 rounded-full bg-white"
                      >
                        <span>{chip}</span>
                        <button
                          onClick={() => handleRemoveChip(chip, setSelectedPreviousCompanies)}
                          className="ml-1 text-red-500 font-bold"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {companies
                  .filter((company) => company.toLowerCase().includes(previousCompanySearchInput.toLowerCase()))
                  .map((company) => (
                    <div
                      key={company}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleCompanySelect(company, selectedPreviousCompanies, setSelectedPreviousCompanies, setPreviousCompanySearchInput, setShowPreviousCompanyOptions)}
                    >
                      {company}
                    </div>
                  ))}
              </div>
            )}
          </div>.
        </div>
        {errorMessage && <div className="text-red-500 text-sm mt-2">{errorMessage}</div>}
        <div className="flex justify-center mt-4 gap-4">
          {projectStep > 1 && (
            <button
              onClick={() => setProjectStep(projectStep - 1)}
              className="bg-gray-500 text-white py-3 px-6 mt-5 rounded-lg hover:bg-gray-600 transition shadow-lg"
              style={{ width: '200px' }}
            >
              Back
            </button>
          )}
          <button
            onClick={handleNextStep}
            className="bg-blue-500 text-white py-3 px-6 mt-5 rounded-lg hover:bg-blue-600 transition shadow-lg"
            style={{ width: '300px' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default NarrowAsk;
