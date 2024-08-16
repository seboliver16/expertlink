"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

// Helper function to generate a random shade of blue
const getRandomBlueShade = () => {
  const shades = [
    "#0077B6", // Ocean Blue
    "#0096C7", // Cerulean Blue
    "#00B4D8", // Cyan Blue
    "#48CAE4", // Sky Blue
    "#90E0EF", // Light Blue
  ];
  return shades[Math.floor(Math.random() * shades.length)];
};

// Helper function to extract initials from a name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("");
};

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

  const experts = [
    {
      name: "John Doe",
      title: "Senior Software Engineer",
      bio: "John is a seasoned software engineer with over 10 years of experience in building scalable web applications and leading engineering teams.",
    },
    {
      name: "Jane Smith",
      title: "Data Scientist",
      bio: "Jane specializes in machine learning and data analytics, helping companies derive actionable insights from big data.",
    },
    {
      name: "Mike Johnson",
      title: "UX Designer",
      bio: "Mike is a creative UX designer who focuses on creating intuitive and user-friendly interfaces for digital products.",
    },
    {
      name: "Sarah Brown",
      title: "Product Manager",
      bio: "Sarah is an experienced product manager known for her strategic vision and ability to drive product innovation and growth.",
    },
    {
      name: "James Williams",
      title: "Marketing Specialist",
      bio: "James is a marketing expert with a talent for crafting compelling campaigns that boost brand awareness and engagement.",
    },
    {
      name: "Patricia Taylor",
      title: "Financial Analyst",
      bio: "Patricia is a skilled financial analyst who excels at evaluating investment opportunities and managing portfolios.",
    },
    {
      name: "Robert Davis",
      title: "Project Manager",
      bio: "Robert is a project manager with a track record of successfully leading cross-functional teams and delivering complex projects.",
    },
    {
      name: "Linda Martinez",
      title: "HR Manager",
      bio: "Linda is an HR manager dedicated to fostering a positive work culture and enhancing employee engagement and development.",
    },
    {
      name: "David Wilson",
      title: "Operations Manager",
      bio: "David is an operations manager with expertise in optimizing business processes and improving operational efficiency.",
    },
    {
      name: "Mary Anderson",
      title: "Business Consultant",
      bio: "Mary is a business consultant who provides strategic advice and solutions to help businesses achieve their goals.",
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate a network request or processing delay
    setTimeout(() => {
      // Set the results to the sample data for demonstration
      setResults(experts);
      setLoading(false);
    }, 2000); // 2-second delay
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndices((prevIndices) => {
      const newIndices = new Set(prevIndices);
      if (newIndices.has(index)) {
        newIndices.delete(index);
      } else {
        newIndices.add(index);
      }
      return newIndices;
    });
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white px-4 py-16">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-12 w-full">
        <div className="flex items-center">
          <img src="/Minerva.svg" alt="Minerva Logo" width={60} height={60} />
          <h1 className="text-5xl font-semibold text-gray-900 ml-3">Minerva</h1>
        </div>
        <form onSubmit={handleSearchSubmit} className="w-full max-w-4xl mt-4">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Browse for experts..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full py-4 pl-5 pr-16 text-lg text-gray-900 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <button
              type="submit"
              className="absolute right-0 mr-4 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Loading Animation */}
      {loading && (
        <div className="flex items-center justify-center py-10">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-600" />
          <span className="ml-4 text-xl font-semibold text-gray-700">Thinking...</span>
        </div>
      )}

      {/* Results Section */}
      {!loading && results.length > 0 && (
        <div className="flex flex-col gap-4 mt-8 w-full max-w-4xl">
          {results.map((expert, index) => (
            <div
              key={index}
              className="flex flex-col items-start bg-gray-100 p-4 rounded-lg shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => toggleExpanded(index)}
            >
              <div className="flex items-center">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-full text-white text-lg font-bold"
                  style={{ backgroundColor: getRandomBlueShade() }}
                >
                  {getInitials(expert.name)}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900">{expert.name}</h3>
                  <p className="text-gray-700">{expert.title}</p>
                </div>
              </div>
              {expandedIndices.has(index) && (
                <div className="mt-4 text-gray-800">
                  <p>{expert.bio}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
