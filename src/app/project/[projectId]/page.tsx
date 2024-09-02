"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { useUser } from '@/app/UserContext';
import Sidebar from '@/app/search/sidebar';
import ChatBar from './sections/chatbar';
import Modal from './sections/modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons/faPencilAlt';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown';
import ExpertCategories from './sections/ExpertCategories';
import { faUserPlus, faCheckCircle, faTrash } from '@fortawesome/free-solid-svg-icons';

const INITIALS_BACKGROUND_COLOR = "#0077B6"; // Ocean Blue

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("");
};

const stripWeirdCharacters = (text: string) => {
  return text.replace(/[^a-zA-Z0-9 .,!?]/g, "");
};

// TF-IDF calculation functions
const calculateTF = (term: string, doc: string) => {
  const words = doc.split(/\s+/); // Simplified splitting
  const termFrequency = words.filter((word) => word.toLowerCase() === term.toLowerCase()).length;
  return termFrequency / words.length;
};

const calculateIDF = (term: string, docs: string[]) => {
  const docsWithTerm = docs.filter(doc => doc.includes(term.toLowerCase())).length;
  return Math.log(docs.length / (1 + docsWithTerm));
};

const calculateTFIDF = (term: string, doc: string, docs: string[]) => {
  const tf = calculateTF(term, doc);
  const idf = calculateIDF(term, docs);
  return tf * idf;
};

// Function to tokenize the text
const tokenize = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove punctuation and special characters
    .split(/\s+/); // Split by whitespace
};

// Function to calculate match percentage
const calculateMatchPercentage = (fieldTokens: string | any[], queryTokens: any[]) => {
  const matchedTokens = queryTokens.filter(token => fieldTokens.includes(token));
  return (matchedTokens.length / queryTokens.length) * 100;
};

// Function to get color based on percentage
const getColorForPercentage = (percentage: number) => {
  const red = Math.min(255, Math.round((1 - percentage / 100) * 255));
  const green = Math.min(255, Math.round((percentage / 100) * 255));
  return `rgb(${red}, ${green}, 0)`; // Returns a color between red and green
};




const ProjectPage = () => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { user } = useUser();
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());
  const [currentMode, setCurrentMode] = useState('search');
  const [categories, setCategories] = useState<string[]>(['General']);
  const [addedExperts, setAddedExperts] = useState<{ [key: string]: string }>({});

  const router = useRouter();

  useEffect(() => {
    const fetchProjectData = async () => {
      if (projectId && user) {
        try {
          const docRef = doc(db, `projects/${user.id}/userProjects/${projectId}`);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProjectData(data);

            if (data.experts) {
              setAddedExperts(data.experts);
            }
          } else {
            console.error("No such document!");
          }
        } catch (error) {
          console.error("Error fetching project:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProjectData();
  }, [projectId, user]);

  if(!user) return;

  const formatExperience = (experience: string) => {
    const blocks = experience.split("\n\n").filter((block) => block.trim() !== "");
    return (
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
        <div className="ml-6 space-y-4">
          {blocks.map((block, index) => {
            const lines = block.split("\n").map((line) => line.trim()).filter((line) => line !== "");
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

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const expertsCollection = collection(db, "experts");
      const expertsSnapshot = await getDocs(expertsCollection);
      const expertsList = expertsSnapshot.docs.map((doc) => doc.data());

      const queryTokens = tokenize(query);

      const scoredResults = expertsList.map((expert) => {
        // Tokenize each field separately
        const nameTokens = tokenize(expert.name);
        const titleTokens = tokenize(expert.title);
        const summaryTokens = tokenize(expert.summary);
        const skillsTokens = tokenize(expert.skills.join(' '));
        const educationTokens = tokenize(expert.education);
        const experienceTokens = tokenize(expert.experience);

        // Calculate match percentage for each field
        const nameScore = calculateMatchPercentage(nameTokens, queryTokens) * 0.4; // 40% weight
        const titleScore = calculateMatchPercentage(titleTokens, queryTokens) * 0.3; // 30% weight
        const summaryScore = calculateMatchPercentage(summaryTokens, queryTokens) * 0.1; // 10% weight
        const skillsScore = calculateMatchPercentage(skillsTokens, queryTokens) * 0.1; // 10% weight
        const educationScore = calculateMatchPercentage(educationTokens, queryTokens) * 0.05; // 5% weight
        const experienceScore = calculateMatchPercentage(experienceTokens, queryTokens) * 0.05; // 5% weight

        // Sum all scores to get the total score
        const totalScore = nameScore + titleScore + summaryScore + skillsScore + educationScore + experienceScore;

        // Ensure the score doesn't exceed 100%
        const normalizedScore = Math.min(totalScore, 100);

        return { ...expert, matchPercentage: normalizedScore };
      });

      const rankedResults = scoredResults.sort((a, b) => b.matchPercentage - a.matchPercentage);

      setSearchResults(rankedResults);
    } catch (error) {
      console.error("Error fetching experts:", error);
    } finally {
      setLoading(false);
    }
  };






const getColorForPercentage = (percentage: number) => {
  const red = Math.min(255, Math.round((1 - percentage / 100) * 255));
  const green = Math.min(255, Math.round((percentage / 100) * 255));
  return `rgb(${red}, ${green}, 0)`; // Returns a color between red and green
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

  const handleAddToCategory = async (expertId: string, category: string) => {
    const updatedProjectData = { ...projectData };

    if (addedExperts[expertId]) {
      // Expert is already added, so we need to remove it
      const currentCategory = addedExperts[expertId];

      // Check if the category and expert exist in the project data
      if (currentCategory && updatedProjectData.categories[currentCategory]) {
        updatedProjectData.categories[currentCategory] = updatedProjectData.categories[currentCategory].filter(
          (id: string) => id !== expertId
        );

        // If the category becomes empty, you can remove it
        if (updatedProjectData.categories[currentCategory].length === 0) {
          delete updatedProjectData.categories[currentCategory];
        }

        const { [expertId]: _, ...restExperts } = addedExperts; // Remove expert from addedExperts

        await updateDoc(doc(db, `projects/${user.id}/userProjects/${projectId}`), {
          categories: updatedProjectData.categories,
          experts: restExperts,
        });

        setProjectData(updatedProjectData);
        setAddedExperts(restExperts);
      }
    } else if (category) {
      // Expert is not added, so we add it to the selected category
      if (!updatedProjectData.categories) {
        updatedProjectData.categories = {};
      }

      if (!updatedProjectData.categories[category]) {
        updatedProjectData.categories[category] = [];
      }

      updatedProjectData.categories[category].push(expertId);

      const updatedExperts = { ...addedExperts, [expertId]: category };

      await updateDoc(doc(db, `projects/${user.id}/userProjects/${projectId}`), {
        categories: updatedProjectData.categories,
        experts: updatedExperts,
      });

      setProjectData(updatedProjectData);
      setAddedExperts(updatedExperts);
    }
  };

  const handleRemoveExpert = async (expertId: string) => {
    if (!addedExperts[expertId]) {
      console.error("Expert not found in added experts.");
      return;
    }

    const { [expertId]: _, ...restExperts } = addedExperts;

    try {
      await updateDoc(doc(db, `projects/${user.id}/userProjects/${projectId}`), {
        experts: restExperts,
      });

      setAddedExperts(restExperts);
      console.log("Expert removed successfully");
    } catch (error) {
      console.error("Error removing expert from Firebase:", error);
    }
  };

  const renderProjectDetails = () => (
    <div className="w-full max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-800">Project: {projectData.title}</h1>
        <button
          onClick={() => setIsEditing(true)}
          className="text-gray-500 hover:text-gray-700"
        >
          <FontAwesomeIcon icon={faPencilAlt} />
        </button>
      </div>
      <div className="space-y-2">
        <p className="text-lg">
          <span className="font-semibold text-gray-700">Role:</span> {projectData.role}
        </p>
        <p className="text-lg">
  <span className="font-semibold text-gray-700">Current Companies:</span>{" "}
  {projectData.currentCompanies ? projectData.currentCompanies.join(", ") : "N/A"}
</p>
<p className="text-lg">
  <span className="font-semibold text-gray-700">Previous Companies:</span>{" "}
  {projectData.previousCompanies ? projectData.previousCompanies.join(", ") : "N/A"}
</p>

      </div>
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Questions:</h2>
        <ul className="list-disc list-inside space-y-2">
          {projectData.questions.map((question: string, index: number) => (
            <li key={index} className="text-lg text-gray-700">
              {question}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        startNewProject={() => {}}
        selectProject={() => {}}
      />
      <div className="flex-grow relative bg-white transition-all duration-300 flex flex-col" style={{ paddingBottom: '72px' }}>
        <div className="absolute top-4 left-4 z-10">
          <div className="relative inline-block text-left">
            <div className="flex items-center">
              <select
                value={currentMode}
                onChange={(e) => setCurrentMode(e.target.value)}
                className="appearance-none bg-white rounded-full py-2 px-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
              >
                <option value="search">Search</option>
                <option value="status">Status</option>
              </select>
              <FontAwesomeIcon
                icon={faCaretDown}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-10">
          {user && (
            <div
              onClick={() => router.push("/profile")}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white cursor-pointer transition-all"
            >
              <span className="text-lg font-semibold">{user.email?.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="flex-grow flex flex-col items-center justify-center px-4 pt-8 pb-20">
          {currentMode === 'search' ? (
            <>
              {loading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                  <p className="text-xl font-semibold text-gray-700">Loading...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col gap-4 mt-6 w-full max-w-3xl">
                  {searchResults.map((expert, index) => (
  <div
    key={index}
    className={`flex flex-col items-start bg-white border border-gray-200 rounded-lg shadow-lg p-6 transition-transform duration-300 ${expandedIndices.has(index) ? 'bg-gray-50' : ''}`}
    onClick={(e) => {
      if (!(e.target as HTMLElement).closest('.action-icon, .category-popup')) {
        toggleExpanded(index);
      }
    }}
  >
    <div className="flex items-center w-full">
      <div
        className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 text-white text-xl font-semibold"
      >
        {getInitials(expert.name)}
      </div>
      <div className="ml-4 flex-grow">
        <h3 className="text-xl font-bold text-gray-900">{expert.name}</h3>
        <p className="text-base text-gray-700">{expert.title}</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span 
            className="font-semibold text-lg"
            style={{ color: getColorForPercentage(expert.matchPercentage) }}
          >
            {expert.matchPercentage.toFixed(0)}%
          </span>
          <span className="text-gray-600 text-sm ml-1">match</span>
        </div>
        <div className="relative flex items-center space-x-2">
          {addedExperts[expert.linkedinId] ? (
            <>
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-2xl text-green-500 cursor-pointer action-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById(`popup-${expert.linkedinId}`)?.classList.toggle('hidden');
                }}
              />
              <FontAwesomeIcon
                icon={faTrash}
                className="text-2xl text-gray-500 cursor-pointer action-icon hover:text-red-500 transition-colors duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveExpert(expert.linkedinId);
                }}
              />
            </>
          ) : (
            <FontAwesomeIcon
              icon={faUserPlus}
              className="text-2xl text-blue-500 cursor-pointer action-icon hover:text-green-500 transition-colors duration-300"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById(`popup-${expert.linkedinId}`)?.classList.toggle('hidden');
              }}
            />
          )}

          {/* Category Selection Popup */}
          <div
            id={`popup-${expert.linkedinId}`}
            className="category-popup absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg hidden z-20"
          >
            {categories.map((category) => (
              <div
                key={category}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCategory(expert.linkedinId, category);
                  document.getElementById(`popup-${expert.linkedinId}`)?.classList.add('hidden');
                }}
              >
                {category}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {expandedIndices.has(index) && (
      <div className="mt-6 text-gray-800 space-y-4">
        <p className="text-sm space-y-2">
          <strong>Summary:</strong>{" "}
          {stripWeirdCharacters(expert.summary)
            .split("\n")
            .map((paragraph, i) => (
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
            href={`https://${expert.linkedinUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View Profile
          </a>
        </p>
      </div>
    )}
  </div>
))}


                </div>
              ) : (
                renderProjectDetails()  // Show project details if no experts found
              )}
            </>
          ) : (
            <ExpertCategories 
              categories={categories}
              setCategories={setCategories}
              addedExperts={addedExperts}
              setAddedExperts={setAddedExperts}
              user={user}
              projectId={projectId}
            />
          )}
        </div>
        {currentMode === 'search' && (
          <ChatBar collapsed={collapsed} projectId={projectId} onSearch={handleSearch} />
        )}
      </div>

      {/* Modal for Editing Project Details */}
      {isEditing && projectData && (
        <Modal onClose={() => setIsEditing(false)} title="Edit Project Details">
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Project Title</h3>
              <input
                type="text"
                value={projectData.title}
                onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              />
            </div>
            {/* Additional editable fields can be added here */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Role</h3>
              <input
                type="text"
                value={projectData.role}
                onChange={(e) => setProjectData({ ...projectData, role: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Current Companies</h3>
              <input
                type="text"
                value={projectData.currentCompanies.join(', ')}
                onChange={(e) => setProjectData({ ...projectData, currentCompanies: e.target.value.split(', ') })}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Previous Companies</h3>
              <input
                type="text"
                value={projectData.previousCompanies.join(', ')}
                onChange={(e) => setProjectData({ ...projectData, previousCompanies: e.target.value.split(', ') })}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectPage;
