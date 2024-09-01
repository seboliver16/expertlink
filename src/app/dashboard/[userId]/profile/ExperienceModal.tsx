import React, { useState } from "react";

interface ExperienceModalProps {
  experience: string;
  onSave: (formattedExperience: string) => void;
  onClose: () => void;
}

const ExperienceModal: React.FC<ExperienceModalProps> = ({ experience, onSave, onClose }) => {
  const [experienceData, setExperienceData] = useState(() => {
    const blocks = experience.split("\n\n").map((block) => {
      const lines = block.split("\n").map((line) => line.trim());
      return { title: lines[0] || "", date: lines[1] || "", description: lines.slice(2).join(" ") };
    });
    return blocks;
  });

  const handleSave = () => {
    const formattedExperience = experienceData
      .map((exp) => `${exp.title}\n${exp.date}\n${exp.description}`)
      .join("\n\n");
    onSave(formattedExperience);
    onClose();
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updatedExperience = [...experienceData];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setExperienceData(updatedExperience);
  };

  const addExperienceBlock = () => {
    setExperienceData([...experienceData, { title: "", date: "", description: "" }]);
  };

  const removeExperienceBlock = (index: number) => {
    const updatedExperience = experienceData.filter((_, i) => i !== index);
    setExperienceData(updatedExperience);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Experience</h2>
        <div className="space-y-4">
          {experienceData.map((exp, index) => (
            <div key={index} className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => handleChange(index, "title", e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="text"
                  value={exp.date}
                  onChange={(e) => handleChange(index, "date", e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={exp.description}
                  onChange={(e) => handleChange(index, "description", e.target.value)}
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
