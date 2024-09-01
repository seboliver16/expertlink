"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.config";

// Static blue shade for all initials
const INITIALS_BACKGROUND_COLOR = "#0077B6"; // Ocean Blue

// Helper function to extract initials from a name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("");
};

// Helper function to strip unwanted characters (like emojis) from a string
const stripWeirdCharacters = (text: string) => {
  return text.replace(/[^a-zA-Z0-9 .,!?]/g, "");
};

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchExperts = async () => {
      setLoading(true);
      try {
        const expertsCollection = collection(db, "experts");
        const expertsSnapshot = await getDocs(expertsCollection);
        const expertsList = expertsSnapshot.docs.map((doc) => doc.data());
        setResults(expertsList);
      } catch (error) {
        console.error("Error fetching experts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredResults = results.filter(
      (expert) =>
        expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stripWeirdCharacters(expert.summary)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
    setResults(filteredResults);
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

  const formatExperience = (experience: string) => {
    // Each experience block is separated by two newline characters "\n\n"
    const blocks = experience.split("\n\n").filter((block) => block.trim() !== "");

    return (
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
        <div className="ml-6 space-y-4">
          {blocks.map((block, index) => {
            const lines = block
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => line !== "");
            const title = lines[0] || "";
            const date = lines[1] || "";
            const description = lines.slice(2).join(" ");

            return (
              <div key={index} className="pl-4">
                <h4 className="font-bold text-md">{title}</h4>
                <p className="text-gray-700 text-sm">{date}</p>
                {description && <p className="text-gray-600 mt-1 text-sm">{description}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white px-4 py-16">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-8 w-full">
        <div className="flex items-center">
          <img src="/Minerva.svg" alt="Minerva Logo" width={50} height={50} />
          <h1 className="text-4xl font-semibold text-gray-900 ml-3">Minerva</h1>
        </div>
        <form onSubmit={handleSearchSubmit} className="w-full max-w-3xl mt-4">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Browse for experts..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full py-3 pl-5 pr-16 text-base text-gray-900 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
        <div className="flex items-center justify-center py-8">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-600" />
          <span className="ml-4 text-xl font-semibold text-gray-700">Loading...</span>
        </div>
      )}

      {/* Results Section */}
      {!loading && results.length > 0 && (
        <div className="flex flex-col gap-4 mt-6 w-full max-w-3xl">
          {results.map((expert, index) => (
            <div
              key={index}
              className={`flex flex-col items-start bg-white border border-gray-200 rounded-lg shadow-lg p-4 transform transition-all duration-300 hover:scale-105 cursor-pointer ${expandedIndices.has(index) ? 'bg-gray-50' : ''}`}
              onClick={(e) => {
                // Prevent expanding the bio when clicking on the checkbox
                if (!(e.target as HTMLElement).matches('input[type="checkbox"]')) {
                  toggleExpanded(index);
                }
              }}
            >
              <div className="flex items-center w-full">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-full text-white text-lg font-bold shadow-lg"
                  style={{ backgroundColor: INITIALS_BACKGROUND_COLOR }}
                >
                  {getInitials(expert.name)}
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-xl font-bold text-gray-900">{expert.name}</h3>
                  <p className="text-base text-gray-700">{expert.title}</p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    className="form-checkbox h-6 w-6 text-blue-600"
                  />
                </div>
              </div>
              {expandedIndices.has(index) && (
                <div className="mt-4 text-gray-800 space-y-4">
                  <p className="text-sm space-y-2">
                    <strong>Summary:</strong>{" "}
                    {stripWeirdCharacters(expert.summary)
                      .split("\n")
                      .map((paragraph: string, i: number) => (
                        <span key={i} className="block mt-2">{paragraph}</span>
                      ))}
                  </p>
                  <p className="text-sm">
                    <strong>Education:</strong> {expert.education}
                  </p>
                  <div className="text-sm space-y-4">
                    <strong>Experience:</strong>
                    {formatExperience(expert.experience)}
                  </div>
                  <p className="text-sm">
                    <strong>Skills:</strong> {expert.skills.join(", ")}
                  </p>
                  <p className="text-sm">
                    <strong>Years of Experience:</strong> {expert.yearsOfExperience}
                  </p>
                  <p className="text-sm">
                    <strong>LinkedIn:</strong>{" "}
                    <a
                      href={expert.linkedinUrl}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()} // Prevent expanding bio when clicking LinkedIn link
                    >
                      {expert.linkedinUrl}
                    </a>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {!loading && results.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <span className="text-xl font-semibold text-gray-700">No experts found.</span>
        </div>
      )}
    </main>
  );
}
