"use client";

import { useState } from 'react';
import axios from 'axios';
import { collection, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.config'; // Ensure your Firebase config is correctly imported

const AddExpert = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>({
    name: '',
    education: '',
    linkedinUrl: '',
    experience: '',
    title: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setPdfFile(file);
  };

  const handleSubmit = async () => {
  if (!pdfFile) return;
  setIsLoading(true);
  const formData = new FormData();
  formData.append('file', pdfFile);

  try {
    // Correct the endpoint to match the file name
    const response = await axios.post('/api/pdf-parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

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

  const handleSave = async () => {
    try {
      // Extract LinkedIn ID from the URL to use as the document ID
      const linkedinId = parsedData.linkedinUrl.split('/').pop();

      // Reference to the 'experts' collection and set the document ID as LinkedIn ID
      const expertRef = doc(db, 'experts', linkedinId);

      await setDoc(expertRef, parsedData);

      alert('Expert information saved successfully!');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error saving expert data:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
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
              <label className="block text-sm font-medium text-gray-700">Experience</label>
              <textarea
                name="experience"
                value={parsedData.experience}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
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
