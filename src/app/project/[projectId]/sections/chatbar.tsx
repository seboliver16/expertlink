import React, { useState } from 'react';
import companies from '../../../../../companies/companies.json'; // Import the companies JSON
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import CompanyModal from './CompanyModal'; // Import the modal component

interface ChatBarProps {
  collapsed: boolean;
  projectId: string;
  onSearch: (query: string) => Promise<void>;
}

const ChatBar: React.FC<ChatBarProps> = ({ collapsed, projectId, onSearch }) => {
  const [inputValue, setInputValue] = useState('');
  const [currentCompanies, setCurrentCompanies] = useState<string[]>([]);
  const [pastCompanies, setPastCompanies] = useState<string[]>([]);
  const [compliantFormers, setCompliantFormers] = useState<string[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [isCurrentModalOpen, setIsCurrentModalOpen] = useState(false);
  const [isPastModalOpen, setIsPastModalOpen] = useState(false);
  const [isCompliantFormersModalOpen, setIsCompliantFormersModalOpen] = useState(false);

  const handleSearchClick = async () => {
    if (inputValue.trim()) {
      await onSearch(inputValue);  // Pass the search query to the onSearch function
      setInputValue(''); // Clear the input after search
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      await handleSearchClick();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsTyping(true);
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const toggleCurrentModal = () => {
    setIsCurrentModalOpen(!isCurrentModalOpen);
  };

  const togglePastModal = () => {
    setIsPastModalOpen(!isPastModalOpen);
  };

  const toggleCompliantFormersModal = () => {
    setIsCompliantFormersModalOpen(!isCompliantFormersModalOpen);
  };

  const handleCurrentCompanySelect = (company: string) => {
    if (!currentCompanies.includes(company)) {
      setCurrentCompanies([...currentCompanies, company]);
    } else {
      setCurrentCompanies(currentCompanies.filter(c => c !== company));
    }
  };

  const handlePastCompanySelect = (company: string) => {
    if (!pastCompanies.includes(company)) {
      setPastCompanies([...pastCompanies, company]);
    } else {
      setPastCompanies(pastCompanies.filter(c => c !== company));
    }
  };

  const handleCompliantFormersSelect = (company: string) => {
    if (!compliantFormers.includes(company)) {
      setCompliantFormers([...compliantFormers, company]);
    } else {
      setCompliantFormers(compliantFormers.filter(c => c !== company));
    }
  };

  const handleRemoveCurrentCompany = (company: string) => {
    setCurrentCompanies(currentCompanies.filter(c => c !== company));
  };

  const handleRemovePastCompany = (company: string) => {
    setPastCompanies(pastCompanies.filter(c => c !== company));
  };

  const handleRemoveCompliantFormers = (company: string) => {
    setCompliantFormers(compliantFormers.filter(c => c !== company));
  };

  const handleClearAllCurrentCompanies = () => {
    setCurrentCompanies([]);
  };

  const handleClearAllPastCompanies = () => {
    setPastCompanies([]);
  };

  const handleClearAllCompliantFormers = () => {
    setCompliantFormers([]);
  };

  const selectedFiltersCount = [currentCompanies.length > 0, pastCompanies.length > 0, compliantFormers.length > 0, yearsOfExperience].filter(Boolean).length;

  return (
    <div
      className={`fixed bottom-0 bg-white transition-all duration-300 z-50`}
      style={{ left: collapsed ? '80px' : '240px', right: '0px'}}
    >
      {/* Dropdowns Section */}
      {filtersVisible && (
        <div className="flex justify-center max-w-full mb-4 mt-2 space-x-8 px-4 transition-all duration-300 ease-in-out transform">
          <button
            onClick={toggleCurrentModal}
            className="w-1/8 py-1.5 px-3 text-sm rounded-full border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            {currentCompanies.length > 0 ? `Current Companies (${currentCompanies.length})` : "Select Current Companies"}
          </button>

          <button
            onClick={togglePastModal}
            className="w-1/8 py-1.5 px-3 text-sm rounded-full border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            {pastCompanies.length > 0 ? `Any Formers (${pastCompanies.length})` : "Select Any Formers"}
          </button>

          <button
            onClick={toggleCompliantFormersModal}
            className="w-1/8 py-1.5 px-3 text-sm rounded-full border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            {compliantFormers.length > 0 ? `12-Month Formers (${compliantFormers.length})` : "Select 12-Month Formers"}
          </button>

          <input
            type="text"
            placeholder="Years of Experience"
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(e.target.value)}
            className="w-1/8 py-1.5 px-3 text-sm rounded-full border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
      )}

      {/* Search Bar Section */}
      <div className="flex items-center space-x-4 mb-10 max-w-full mx-auto rounded-full" style={{ padding: '8px 16px', backgroundColor: 'white', width: '75%', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <input
          type="text"
          placeholder="Type your search..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="flex-grow rounded-full border border-transparent focus:outline-none focus:ring-0"
          style={{ paddingLeft: '16px' }}
        />
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSearchClick}
            className={`py-2 px-4 rounded-full transition ${inputValue.trim() ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}
            style={{ padding: '0 12px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            disabled={!inputValue.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Filter Toggle Button */}
          <button
            onClick={toggleFilters}
            className={`relative border border-gray-400 rounded-full p-3 transition focus:outline-none ${
              filtersVisible ? 'bg-gray-700 text-white' : 'text-gray-700 hover:text-gray-900 hover:border-gray-600'
            }`}
            style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FontAwesomeIcon icon={faFilter} />
            {selectedFiltersCount > 0 && (
              <div className="absolute top-[1px] right-[1px] bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                {selectedFiltersCount}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Modal for Selecting Current Companies */}
      {isCurrentModalOpen && (
        <CompanyModal
          selectedCompanies={currentCompanies}
          onCompanySelect={handleCurrentCompanySelect}
          onRemoveCompany={handleRemoveCurrentCompany}
          onClearAllCompanies={handleClearAllCurrentCompanies} // Pass the clear all function
          onClose={toggleCurrentModal}
        />
      )}

      {/* Modal for Selecting Past Companies */}
      {isPastModalOpen && (
        <CompanyModal
          selectedCompanies={pastCompanies}
          onCompanySelect={handlePastCompanySelect}
          onRemoveCompany={handleRemovePastCompany}
          onClearAllCompanies={handleClearAllPastCompanies} // Pass the clear all function
          onClose={togglePastModal}
        />
      )}

      {/* Modal for Selecting Compliant Formers */}
      {isCompliantFormersModalOpen && (
        <CompanyModal
          selectedCompanies={compliantFormers}
          onCompanySelect={handleCompliantFormersSelect}
          onRemoveCompany={handleRemoveCompliantFormers}
          onClearAllCompanies={handleClearAllCompliantFormers} // Pass the clear all function
          onClose={toggleCompliantFormersModal}
        />
      )}
    </div>
  );
};

export default ChatBar;
