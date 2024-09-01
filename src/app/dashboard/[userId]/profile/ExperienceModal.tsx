import React, { useState, useEffect, useRef } from "react";
import { format, isValid, parse, differenceInMonths, differenceInYears } from 'date-fns';

interface ExperienceModalProps {
  experience: string;
  onSave: (formattedExperience: string) => void;
  onClose: () => void;
}

interface ExperienceBlock {
  title: string;
  startDate: Date | null;
  endDate: Date | null;
  description: string;
}

const ExperienceModal: React.FC<ExperienceModalProps> = ({ experience, onSave, onClose }) => {
  const [experienceData, setExperienceData] = useState<ExperienceBlock[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorFields, setErrorFields] = useState<Set<string>>(new Set());
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parsedExperience = parseExperience(experience);
    setExperienceData(parsedExperience);
  }, [experience]);

  useEffect(() => {
    if (errorMessage && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errorMessage]);

  const handleSave = () => {
    const newErrorFields = new Set<string>();

    // Validate all experience blocks
    for (let i = 0; i < experienceData.length; i++) {
      const exp = experienceData[i];
      if (!exp.title) newErrorFields.add(`title-${i}`);
      if (!exp.startDate || !isValid(exp.startDate)) newErrorFields.add(`startDate-${i}`);
      if ((!exp.endDate && exp.endDate !== null) || (exp.endDate && !isValid(exp.endDate))) newErrorFields.add(`endDate-${i}`);
      if (exp.startDate && exp.endDate && exp.startDate > exp.endDate) {
        newErrorFields.add(`startDate-${i}`);
        newErrorFields.add(`endDate-${i}`);
        setErrorMessage("Start date cannot be after end date.");
        break;
      }
    }

    if (newErrorFields.size > 0) {
      setErrorFields(newErrorFields);
      setErrorMessage("Please ensure all fields are filled out correctly.");
      return;
    }

    const formattedExperience = experienceData
      .map((exp) => {
        const startDateFormatted = isValid(exp.startDate) ? format(exp.startDate!, 'MMMM yyyy') : '';
        const endDateFormatted = isValid(exp.endDate) ? format(exp.endDate!, 'MMMM yyyy') : 'Present';
        const duration = calculateDuration(exp.startDate, exp.endDate);
        return `${exp.title}\n${startDateFormatted} - ${endDateFormatted} (${duration})\n${exp.description}`;
      })
      .join("\n\n");
    
    onSave(formattedExperience);
    onClose();
  };

  const parseExperience = (experience: string): ExperienceBlock[] => {
    const blocks = experience.split("\n\n").filter((block) => block.trim() !== "");

    return blocks.map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter((line) => line !== "");
      const title = lines[0] || "";
      const dateRange = lines[1]?.match(/(.*?)-(.*?)\(/);
      const startDateStr = dateRange ? dateRange[1].trim() : "";
      const endDateStr = dateRange ? dateRange[2].trim() : "Present";
      const description = lines.slice(2).join(" ");

      const startDate = startDateStr ? parse(startDateStr, 'MMMM yyyy', new Date()) : null;
      const endDate = endDateStr === "Present" ? new Date() : (endDateStr ? parse(endDateStr, 'MMMM yyyy', new Date()) : null);

      return { title, startDate, endDate, description };
    });
  };

  const handleInputChange = (index: number, field: keyof ExperienceBlock, value: string | Date | null) => {
    const updatedExperience = [...experienceData];
    if (typeof value === "string" && field !== "description" && (field === "startDate" || field === "endDate")) {
      value = value ? parse(value, 'yyyy-MM', new Date()) : null;
    }
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setExperienceData(updatedExperience);
    setErrorFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete(`${field}-${index}`);
      return newSet;
    });
  };

  const addExperienceBlock = () => {
    setExperienceData([{ title: "", startDate: null, endDate: null, description: "" }, ...experienceData]);
  };

  const removeExperienceBlock = (index: number) => {
    const updatedExperience = experienceData.filter((_, i) => i !== index);
    setExperienceData(updatedExperience);
  };

  const calculateDuration = (start: Date | null, end: Date | null): string => {
    if (!start) return '';
    const endDate = end || new Date();
    const years = differenceInYears(endDate, start);
    const months = differenceInMonths(endDate, start) % 12;
    let duration = '';

    if (years > 0) {
      duration += `${years} year${years > 1 ? 's' : ''} `;
    }

    if (months > 0) {
      duration += `${months} month${months > 1 ? 's' : ''}`;
    }

    return duration.trim();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg overflow-y-auto max-h-[90vh] relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg font-semibold"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Edit Experience</h2>
        {errorMessage && (
          <div ref={errorRef} className="text-red-600 text-sm mb-4">
            {errorMessage}
          </div>
        )}
        <div className="space-y-6">
          {experienceData.map((exp, index) => (
            <div key={index} className="space-y-4 border-t border-gray-300 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <textarea
                  value={exp.title}
                  onChange={(e) => handleInputChange(index, "title", e.target.value)}
                  className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errorFields.has(`title-${index}`) ? 'border-red-500' : ''}`}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="month"
                    value={exp.startDate && isValid(exp.startDate) ? format(exp.startDate, 'yyyy-MM') : ''}
                    onChange={(e) => handleInputChange(index, "startDate", e.target.value ? new Date(e.target.value) : null)}
                    className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errorFields.has(`startDate-${index}`) ? 'border-red-500' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="month"
                    value={exp.endDate && isValid(exp.endDate) ? format(exp.endDate, 'yyyy-MM') : ''}
                    onChange={(e) => handleInputChange(index, "endDate", e.target.value ? new Date(e.target.value) : null)}
                    className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errorFields.has(`endDate-${index}`) ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={exp.description}
                  onChange={(e) => handleInputChange(index, "description", e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeExperienceBlock(index)}
                className="text-red-600 hover:text-red-900 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addExperienceBlock}
            className="mt-4 py-2 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-lg hover:bg-blue-700"
          >
            Add New Experience
          </button>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-lg border border-gray-500 text-gray-500 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceModal;
