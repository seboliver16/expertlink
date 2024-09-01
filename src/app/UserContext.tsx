"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import User from './models/User';
import { db } from './firebase.config';
import Project from './models/project';

interface UserContextProps {
  user: User | null;
  setUser: (user: User) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email!;
        const userDocRef = doc(db, 'users', email);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Create a Map of Project instances from Firebase data
          // Assuming the structure of projectData matches the Project class properties
const projectsMap = new Map<string, Project>(
  Object.entries(userData.projects || {}).map(([id, projectData]) => {
    const data = projectData as {
      title: string;
      description: string;
      questions: string[];
      expertStatus: string;
      seekerStatus: string;
      categories: string[];
      askingPrice: number;
      availability: string[];
    };

    return [
      id,
      new Project(
        id,
        data.title,
        data.description,
        data.questions || [],
        data.expertStatus || 'Open Opportunity',
        data.seekerStatus || 'Pending Response',
        data.categories || [],
        data.askingPrice || 0,
        data.availability || []
      ),
    ];
  })
);


          const statusMap = new Map<string, string>(Object.entries(userData.status || {}));

          // Set the user state with the data pulled from Firebase
          setUser(new User(
            email,
            userData.name,
            email,
            userData.type || 'unknown',
            userData.linkedinId || '',
            projectsMap,
            userData.credits || 0,
            statusMap,
            userData.projectsCompleted || 0,
            userData.lifetimeIncome || 0
          ));

        } else {
          console.log("User document does not exist.");
          // Handle this case appropriately if needed
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
          <p className="text-lg font-semibold text-gray-700">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};


