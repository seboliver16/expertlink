import React, { useState } from 'react';
import companies from '../../../../../companies/companies.json'; // Import the companies JSON

interface CompanyModalProps {
  selectedCompanies: string[];
  onCompanySelect: (company: string) => void;
  onRemoveCompany: (company: string) => void;
  onClearAllCompanies: () => void;
  onClose: () => void;
}

const CompanyModal: React.FC<CompanyModalProps> = ({
  selectedCompanies,
  onCompanySelect,
  onRemoveCompany,
  onClearAllCompanies,
  onClose,
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const filteredCompanies = searchValue
    ? companies
        .filter((company) => company.toLowerCase().includes(searchValue.toLowerCase()))
        .slice(0, 5) // Limit to 5 autocomplete suggestions
    : [];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-md shadow-lg w-full max-w-lg p-6 relative" style={{ height: '500px' }}>
        <h2 className="text-xl font-semibold mb-4">Select Companies</h2>
        <input
          type="text"
          placeholder="Search Companies..."
          value={searchValue}
          onChange={handleSearchChange}
          className="w-full py-2 px-4 border border-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          style={{ boxSizing: 'border-box', borderRadius: '4px' }}
        />
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCompanies.map((company, index) => (
            <div key={index} className="bg-gray-100 text-gray-800 px-3 py-1 border border-gray-400 rounded-md text-sm flex items-center">
              {company}
              <button
                className="ml-2 text-gray-800 hover:text-gray-900"
                onClick={() => onRemoveCompany(company)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <div className="mb-4">
          {filteredCompanies.map((company, index) => (
            <div
              key={index}
              className="py-1 px-2 cursor-pointer hover:bg-blue-100 rounded-md text-gray-700 border-b border-gray-200"
              onClick={() => onCompanySelect(company)}
            >
              {company}
            </div>
          ))}
        </div>
        <div className="absolute bottom-6 left-0 right-0 flex justify-between px-6">
          <button
            onClick={onClearAllCompanies}
            className="bg-transparent border border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white transition-all duration-200 ease-in-out"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="bg-transparent border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-500 hover:text-white transition-all duration-200 ease-in-out"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;
