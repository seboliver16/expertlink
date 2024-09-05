import React, { useState, useEffect } from "react";
import { doc, DocumentData, getDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/app/firebase.config";
import { useUser } from "@/app/UserContext";
import { DateTime } from 'luxon';

interface ConfirmQuestionsProps {
  onClose: () => void;
  onSend: (selectedExperts: string[]) => void;
  selectedExperts: string[];
  projectId: string;
}

interface Expert {
  name: string;
  title: string;
  email?: string;
  linkedinUrl?: string;
}

const ConfirmQuestions: React.FC<ConfirmQuestionsProps> = ({
  onClose,
  onSend,
  selectedExperts,
  projectId,
}) => {
  const { user } = useUser();
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>(Array(10).fill(""));
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState<DocumentData>();
  const [experts, setExperts] = useState<{ [key: string]: Expert }>({});


  useEffect(() => {
    const fetchProjectData = async () => {
      if (user && projectId) {
        try {
          const docRef = doc(db, `projects/${user.email}/userProjects/${projectId}`);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProjectData(docSnap.data())
            setProjectDescription(projectData?.description || "");
            setProjectName(projectData?.title || "");
            setQuestions((prevQuestions) =>
              docSnap.data().questions
                ? [...docSnap.data().questions, ...prevQuestions.slice(docSnap.data().questions.length)]
                : prevQuestions
            );
          }
        } catch (error) {
          console.error("Error fetching project data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchExperts = async () => {
      if (selectedExperts.length > 0) {
        try {
          const fetchedExperts: { [key: string]: Expert } = {};
          for (const expertId of selectedExperts) {
            const expertRef = doc(db, "experts", expertId);
            const expertSnap = await getDoc(expertRef);
            if (expertSnap.exists()) {
              fetchedExperts[expertId] = expertSnap.data() as Expert;
            }
          }
          setExperts(fetchedExperts);
        } catch (error) {
          console.error("Error fetching experts data:", error);
        }
      }
    };

    fetchProjectData();
    fetchExperts();
  }, [user, projectId, selectedExperts]);

  if (!user) return null;

  const isValidQuestion = (question: string): boolean => {
    return question.replace(/\s+/g, '').length >= 5;
  };

  const handleQuestionChange = (index: number, value: string) => {
    setQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[index] = value.slice(0, 200);
      return updatedQuestions;
    });
  };

  const handleSend = async () => {
  try {
    console.log('Updating project questions...');
    console.log("PROJECT DATA",projectData)
    const updatedQuestions = questions.filter((q) => q.trim().length > 0);

    // Update the project's questions in Firestore if needed
    // await updateDoc(doc(db, `projects/${user.email}userProjects/${projectId}`), {
    //   questions: updatedQuestions,
    // });

    // Create a batch operation
    const batch = writeBatch(db);

    selectedExperts.forEach(expertId => {
      const expert = experts[expertId];
      console.log(`Preparing to write Firestore document for expert: ${expert.name}, email: ${expert.email}`);

      // Define the email data structure
      const emailData = {
        expertName: expert.name,
        expertEmail: expert.email,
        projectName: projectData?.title,  // or the actual project name if available
        projectDescription: projectData?.description,
        time: DateTime.now().toISO()
      };

      // Add a new document to the emails collection
      const emailRef = doc(db, 'emails', expertId +"_"+ projectId); // Generate a new document reference with expertId as the document ID
      batch.set(emailRef, emailData);

      // Add the project to the expert's collection
      const expertProjectRef = doc(db, `projects/${expert.email}/userProjects/${projectId}`);
      batch.set(expertProjectRef, projectData);
    });

    // Commit the batch
    await batch.commit();

    console.log('Emails written to Firestore successfully');
    alert('Emails written to Firestore successfully! The Cloud Function will handle the sending.');

    onSend(selectedExperts);
  } catch (error) {
    console.error("Error writing emails to Firestore or updating questions:", error);
    alert('Error writing emails to Firestore or updating questions');
  }
};




  return (
    <div className="fixed inset-0 flex overflow-hidden z-10">
      <div className="w-1/2 p-8 bg-white shadow-lg flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Project Details</h2>
        {loading ? (
          <p className="text-gray-700">Loading...</p>
        ) : (
          <>
            <div className="mb-8">
              {/* <h3 className="text-lg font-semibold mb-2">{projectData!.title}</h3>
              <p className="text-gray-700">{projectData!.description}</p> */}
            </div>
            <div className="flex-1 overflow-auto">
              <h3 className="text-lg font-semibold mb-2">Experts Being Contacted</h3>
              <ul className="space-y-4">
                {selectedExperts.map((expertId, index) => {
                  const expert = experts[expertId];
                  return (
                    <li
                      key={index}
                      className="bg-white bg-opacity-20 backdrop-blur-md border border-gray-300 p-4 rounded-lg shadow-md"
                    >
                      <p className="font-bold text-gray-900">{expert?.name || 'Expert Name'}</p>
                      <p className="text-sm text-gray-600">{expert?.title || 'Title'}</p>
                      {expert?.email ? (
                        <a href={`mailto:${expert.email}`} className="text-blue-600 hover:underline">{expert.email}</a>
                      ) : expert?.linkedinUrl ? (
                        <a href={`https:${expert.linkedinUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          LinkedIn Profile
                        </a>
                      ) : (
                        <p className="text-sm text-gray-500">No contact info available</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
        <div className="mt-8 flex space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white py-3 px-20 rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white py-3 px-20 rounded-lg hover:bg-blue-600 transition"
          >
            Send Email
          </button>
        </div>
      </div>

      <div className="w-1/2 p-8 bg-gray-50 overflow-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Qualifying Questions</h2>
        <div className="space-y-4">
          {questions.map((question, index) => (
            <input
              key={index}
              type="text"
              value={question}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              placeholder={`#${index + 1} Qualifying Question (optional)`}
              className="block w-full border-2 rounded-lg p-3 text-lg"
              maxLength={200}
              disabled={index > 0 && !isValidQuestion(questions[index - 1])}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConfirmQuestions;
