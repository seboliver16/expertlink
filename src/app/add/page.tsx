"use client";

import { useState } from 'react';
import axios from 'axios';
import { collection, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.config';

const AddExpert = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>({
    name: '',
    title: '',
    summary: '',
    education: '',
    linkedinUrl: '',
    linkedinId: '',
    experience: '',
    skills: [],
    yearsOfExperience: 0,  // Added the yearsOfExperience field
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setPdfFile(file);
  };

  const handleSubmit = async () => {
    if (!pdfFile) {
      console.error('No file selected');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      console.log('Sending request to /api/pdf-parse');
      const response = await axios.post('/api/pdf-parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response received:', response.data);
      setParsedData(response.data);
    } catch (error) {
      console.error('Error uploading and parsing the PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setParsedData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSkillsChange = (index: number, value: string) => {
    const updatedSkills = [...parsedData.skills];
    updatedSkills[index] = value;
    setParsedData((prevState: any) => ({
      ...prevState,
      skills: updatedSkills,
    }));
  };

  const handleAddSkill = () => {
    setParsedData((prevState: any) => ({
      ...prevState,
      skills: [...prevState.skills, ''],
    }));
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = parsedData.skills.filter((_: string, i: number) => i !== index);
    setParsedData((prevState: any) => ({
      ...prevState,
      skills: updatedSkills,
    }));
  };

  const handleSave = async () => {
    try {
      const expertRef = doc(db, 'experts', parsedData.linkedinId);

      await setDoc(expertRef, {
        ...parsedData,
        skills: parsedData.skills.filter((skill: string) => skill.trim() !== ''), // Save only non-empty skills
      });

      alert('Expert information saved successfully!');
    } catch (error) {
      console.error('Error saving expert data:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Add Expert</h1>
        <div className="mb-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button
          onClick={handleSubmit}
          className={`w-full bg-blue-600 text-white py-3 rounded-lg transition ${
            !pdfFile || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
          disabled={!pdfFile || isLoading}
        >
          {isLoading ? 'Parsing...' : 'Upload and Parse PDF'}
        </button>

        {parsedData.name && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Verify and Edit Expert Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={parsedData.name}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={parsedData.title}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <input
                type="number"
                name="yearsOfExperience"
                value={parsedData.yearsOfExperience}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Summary</label>
              <textarea
                name="summary"
                value={parsedData.summary}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Education</label>
              <textarea
                name="education"
                value={parsedData.education}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
              <input
                type="text"
                name="linkedinUrl"
                value={parsedData.linkedinUrl}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LinkedIn ID</label>
              <input
                type="text"
                name="linkedinId"
                value={parsedData.linkedinId}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience</label>
              <textarea
                name="experience"
                value={parsedData.experience}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Skills</label>
              {parsedData.skills.map((skill: string, index: number) => (
                <div key={index} className="flex items-center mt-1">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillsChange(index, e.target.value)}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="ml-2 text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSkill}
                className="mt-2 text-blue-600 hover:text-blue-900"
              >
                Add Skill
              </button>
            </div>
            <button
              onClick={handleSave}
              className="w-full bg-green-600 text-white py-3 mt-4 rounded-lg hover:bg-green-700 transition"
            >
              Save Expert
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddExpert;
