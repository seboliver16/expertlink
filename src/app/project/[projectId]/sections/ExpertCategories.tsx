"use client";

import React, { useEffect, useState } from 'react';
import { getDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faCaretDown, faTimes, faChevronDown, faChevronUp, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { db } from '@/app/firebase.config';
import ConfirmQuestions from './ConfirmQuestions';
import { useRouter } from 'next/navigation';

interface ExpertCategoriesProps {
  categories: string[];
  setCategories: (categories: string[]) => void;
  addedExperts: { [key: string]: string };
  setAddedExperts: (experts: { [key: string]: string }) => void;
  user: any;
  projectId: string;
}

interface Expert {
  name: string;
  title: string;
  summary: string;
  education: string;
  experience: string;
  skills: string[];
  yearsOfExperience: string;
  linkedinUrl: string;
}

const ExpertCategories: React.FC<ExpertCategoriesProps> = ({
  categories,
  setCategories,
  addedExperts,
  setAddedExperts,
  user,
  projectId,
}) => {
  const [experts, setExperts] = useState<{ [key: string]: Expert }>({});
  const [expandedIndices, setExpandedIndices] = useState<Set<string>>(new Set());
  const [contactedExperts, setContactedExperts] = useState<{ [key: string]: string }>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || 'General');
  const [showConfirmQuestions, setShowConfirmQuestions] = useState(false);
  const router = useRouter();

  const areObjectsEqual = (obj1: { [key: string]: any }, obj2: { [key: string]: any }): boolean => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    const fetchExperts = async () => {
      if (Object.keys(addedExperts).length > 0) {
        const fetchedExperts: { [key: string]: Expert } = {};

        for (const expertId of Object.keys(addedExperts)) {
          if (!experts[expertId]) {
            const docRef = doc(db, 'experts', expertId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              fetchedExperts[expertId] = docSnap.data() as Expert;
            }
          }
        }

        if (Object.keys(fetchedExperts).length > 0) {
          setExperts((prevExperts) => ({
            ...prevExperts,
            ...fetchedExperts,
          }));
        }
      }
    };

    fetchExperts();

    const unsubscribe = onSnapshot(doc(db, `projects/${user.id}/userProjects/${projectId}`), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (!areObjectsEqual(data.experts || {}, addedExperts)) {
          setAddedExperts(data.experts || {});
        }
        if (!areObjectsEqual(data.categories || {}, categories)) {
          const updatedCategories = data.categories || [];
          setCategories(updatedCategories);

          if (!updatedCategories.includes(activeCategory)) {
            setActiveCategory(updatedCategories[0] || 'General');
          }
        }
        if (data.contactedExperts) {
          setContactedExperts(data.contactedExperts);
        }
      }
    });

    return () => unsubscribe();
  }, [projectId, setAddedExperts, setCategories, user.id, addedExperts, experts, categories, activeCategory]);

  const handleAddCategory = (category: string) => {
    if (category && !categories.includes(category) && categories.length < 5) {
      const updatedCategories = [...categories, category];
      setCategories(updatedCategories);
      updateDoc(doc(db, `projects/${user.id}/userProjects/${projectId}`), {
        categories: updatedCategories,
      });
      setNewCategoryName('');
    }
  };

  const handleUpdateCategory = async (expertId: string, newCategory: string) => {
    const currentCategory = addedExperts[expertId];
    if (currentCategory === newCategory) return;

    const updatedExperts = { ...addedExperts, [expertId]: newCategory };

    await updateDoc(doc(db, `projects/${user.id}/userProjects/${projectId}`), {
      experts: updatedExperts,
    });

    setAddedExperts(updatedExperts);
  };

  const handleRemoveExpert = async (expertId: string) => {
    if (!addedExperts[expertId]) return;

    const confirmation = window.confirm("Are you sure you want to remove this expert?");
    if (!confirmation) return;

    const updatedExperts = { ...addedExperts };
    delete updatedExperts[expertId];

    try {
      await updateDoc(doc(db, `projects/${user.id}/userProjects/${projectId}`), {
        experts: updatedExperts,
      });

      setAddedExperts(updatedExperts);
    } catch (error) {
      console.error("Error removing expert from Firebase:", error);
    }
  };

  const handleRemoveCategory = async (category: string) => {
    if (category === 'General') return;

    const updatedCategories = categories.filter((cat) => cat !== category);
    const updatedExperts = { ...addedExperts };

    Object.keys(updatedExperts).forEach((expertId) => {
      if (updatedExperts[expertId] === category) {
        updatedExperts[expertId] = 'General';
      }
    });

    await updateDoc(doc(db, `projects/${user.id}/userProjects/${projectId}`), {
      categories: updatedCategories,
      experts: updatedExperts,
    });

    setCategories(updatedCategories);
    setAddedExperts(updatedExperts);
    if (activeCategory === category) {
      setActiveCategory(updatedCategories[0] || 'General');
    }
  };

  const toggleDropdown = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.toggle('hidden');
    }
  };

  const toggleExpanded = (expertId: string) => {
    setExpandedIndices((prevIndices) => {
      const newIndices = new Set(prevIndices);
      if (newIndices.has(expertId)) {
        newIndices.delete(expertId);
      } else {
        newIndices.add(expertId);
      }
      return newIndices;
    });
  };

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

  const handleToggleContact = async (expertId: string) => {
    let newStatus = 'added';

    switch (contactedExperts[expertId]) {
      case 'added':
        newStatus = 'no_contact';
        break;
      case 'pending_response':
        newStatus = 'pending_response';
        break;
      case 'response_submitted':
        newStatus = 'response_submitted';
        break;
      default:
        newStatus = 'added';
    }

    if (newStatus === 'pending_response' || newStatus === 'response_submitted') {
      // Do nothing for now if status is pending_response or response_submitted
      return;
    }

    const updatedContactedExperts = {
      ...contactedExperts,
      [expertId]: newStatus,
    };

    setContactedExperts(updatedContactedExperts);

    await updateDoc(doc(db, `projects/${user.id}/userProjects/${projectId}`), {
      contactedExperts: updatedContactedExperts,
    });
  };

  const handleMailButtonClick = () => {
    if (Object.keys(contactedExperts).filter(key => contactedExperts[key] === 'added').length > 0) {
      setShowConfirmQuestions(true);
    } else {
      alert('No experts selected');
    }
  };

  const handleSendEmail = async (selectedExperts: string[]) => {
    const updatedContactedExperts = { ...contactedExperts };
    selectedExperts.forEach((expertId) => {
      updatedContactedExperts[expertId] = "pending_response";
    });
    await updateDoc(doc(db, `projects/${user.id}/userProjects/${projectId}`), {
      contactedExperts: updatedContactedExperts,
    });
    setContactedExperts(updatedContactedExperts);
    setShowConfirmQuestions(false);
  };

  return (
    <div className="w-full h-full max-w-3xl space-y-6 z-10000000">
      <button
        onClick={handleMailButtonClick}
        className={`flex mt-8 items-center space-x-2 py-1 px-3 rounded-md text-sm transition-colors duration-300 border-2 ${
          Object.keys(contactedExperts).filter(key => contactedExperts[key] === 'added').length > 0
            ? 'border-black text-black hover:bg-black hover:text-white'
            : 'border-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={Object.keys(contactedExperts).filter(key => contactedExperts[key] === 'added').length === 0}
      >
        <FontAwesomeIcon icon={faEnvelope} />
        <span>
          Contact {Object.keys(contactedExperts).filter(key => contactedExperts[key] === 'added').length} Founder(s)
        </span>
      </button>
      <div className="flex justify-between items-center ">
        <div className="flex space-x-4 overflow-x-auto max-h-16 ">
          {categories.map((category) => (
            <div key={category} className="relative flex items-center">
              <div
                onClick={() => setActiveCategory(category)}
                className={`py-2 px-4 rounded-full focus:outline-none transition-all duration-300 ${
                  activeCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                } flex items-center`}
              >
                <span className="whitespace-nowrap">{category}</span>
                {category !== 'General' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete the category "${category}"?`)) {
                        handleRemoveCategory(category);
                      }
                    }}
                    className="ml-2 text-grey-500 hover:text-grey-700"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {categories.length < 5 && (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newCategoryName.trim()) {
                    handleAddCategory(newCategoryName);
                  }
                }}
                placeholder="Add category"
                maxLength={20}
                className="py-2 px-4 rounded-full border focus:outline-none"
              />

              <button onClick={() => handleAddCategory(newCategoryName)} className="text-blue-500 hover:text-green-500 transition-colors">
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="transition-all duration-500 transform">
        {Object.keys(addedExperts)
          .filter((expertId) => addedExperts[expertId] === activeCategory)
          .map((expertId) => (
            <div
              key={expertId}
              className={`bg-white border border-gray-200 rounded-lg shadow-lg p-4 mb-4 flex flex-col items-start justify-between ${
                expandedIndices.has(expertId) ? 'bg-gray-50' : ''
              }`}
            >
              <div
                className="w-full flex items-center cursor-pointer"
                onClick={() => toggleExpanded(expertId)}
              >
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900">
                    {experts[expertId]?.name || 'Loading...'}
                  </h4>
                  <p className="text-sm text-gray-600">{experts[expertId]?.title || 'Loading...'}</p>
                </div>
                <FontAwesomeIcon
                  icon={expandedIndices.has(expertId) ? faChevronUp : faChevronDown}
                  className="text-gray-500"
                />
              </div>
              {expandedIndices.has(expertId) && (
                <div className="mt-4 text-gray-800 space-y-4 w-full">
                  <p className="text-sm space-y-2">
                    <strong>Summary:</strong>{" "}
                    {experts[expertId]?.summary
                      ?.split("\n")
                      .map((paragraph: string, i: number) => (
                        <span key={i} className="block mt-2">
                          {paragraph}
                        </span>
                      ))}
                  </p>
                  <p className="text-sm">
                    <strong>Education:</strong> {experts[expertId]?.education}
                  </p>
                  <div className="text-sm space-y-4">
                    <strong>Experience:</strong>
                    {formatExperience(experts[expertId]?.experience || '')}
                  </div>
                  <p className="text-sm">
                    <strong>Skills:</strong> {experts[expertId]?.skills?.join(", ")}
                  </p>
                  <p className="text-sm">
                    <strong>Years of Experience:</strong> {experts[expertId]?.yearsOfExperience}
                  </p>
                  <p className="text-sm">
                    <strong>LinkedIn:</strong>{" "}
                    <a
                      href={`https://${experts[expertId]?.linkedinUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {experts[expertId]?.linkedinUrl}
                    </a>
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-4 mt-4 w-full justify-between">
                <div className="relative">
                  <button
                    className="py-2 px-4 bg-transparent text-white rounded-full flex items-center justify-center relative border-2 border-transparent hover:border-gradient hover:text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-none bg-clip-text hover:bg-gradient-to-r hover:from-purple-400 hover:via-pink-500 hover:to-red-500 transition-all duration-500"
                    onClick={() => toggleDropdown(`dropdown-${expertId}`)}
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 flex items-center">
                      <span>{addedExperts[expertId]}</span>
                      <FontAwesomeIcon icon={faCaretDown} className="ml-2 text-black" />
                    </span>
                  </button>

                  <div
                    id={`dropdown-${expertId}`}
                    className="absolute mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 hidden"
                  >
                    {categories.map((category) => (
                      <div
                        key={category}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          handleUpdateCategory(expertId, category);
                          toggleDropdown(`dropdown-${expertId}`);
                        }}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  
                  <button
                    onClick={() => handleToggleContact(expertId)}
                    className={`py-2 px-4 rounded-full text-white ${
                      contactedExperts[expertId] === 'added'
                        ? 'bg-black'
                        : contactedExperts[expertId] === 'pending_response'
                        ? 'bg-orange-400 cursor-not-allowed'
                        : contactedExperts[expertId] === 'response_submitted'
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    } ${contactedExperts[expertId] === 'pending_response' ? '' : 'hover:bg-black'} transition-colors`}
                    disabled={contactedExperts[expertId] === 'pending_response'}
                  >
                    {contactedExperts[expertId] === 'added'
                      ? 'Added'
                      : contactedExperts[expertId] === 'pending_response'
                      ? 'Pending Response'
                      : contactedExperts[expertId] === 'response_submitted'
                      ? 'Response Submitted'
                      : 'Add to Contact List'}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to remove this expert?")) {
                        handleRemoveExpert(expertId);
                      }
                    }}
                    className="py-2 px-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 hover:text-black transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        {Object.keys(addedExperts).filter((expertId) => addedExperts[expertId] === activeCategory)
          .length === 0 && <p className="text-gray-500">Expert List Empty</p>}
      </div>
      <div >
      {showConfirmQuestions && (
        <ConfirmQuestions
          projectId={projectId}
          onClose={() => setShowConfirmQuestions(false)}
          onSend={handleSendEmail}
          selectedExperts={Object.keys(contactedExperts).filter(key => contactedExperts[key] === 'added')}
        />
      )}
      </div>
    </div>
  );
};

export default ExpertCategories;
