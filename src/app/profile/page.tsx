"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../firebase.config";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);
  const [credits, setCredits] = useState(150); // Hardcoded credits for now
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email!;
        const docRef = doc(db, "users", email); // Use email as the document ID
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userProjectsRef = collection(db, "projects", email, "userProjects");
          const userProjectsSnapshot = await getDocs(userProjectsRef);
          setProjectCount(userProjectsSnapshot.size); // Count the number of projects

          setUserData(docSnap.data());
        } else {
          console.log("User document does not exist.");
        }
        setLoading(false);
      } else {
        router.push("/auth");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth");
  };

  const handleSave = async () => {
    if (auth.currentUser && userData) {
      const email = auth.currentUser.email!;
      const docRef = doc(db, "users", email); // Use email as the document ID
      await updateDoc(docRef, userData);
      alert("Profile updated!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-300">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
          <p className="text-lg font-semibold text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 p-6">
      <div className="bg-white shadow-2xl rounded-lg p-10 max-w-lg w-full">
        <h1 className="text-4xl font-extrabold text-blue-600 text-center mb-8">Your Profile</h1>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{userData.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={userData?.name || ""}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all"
            />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Projects</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{projectCount}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Credits</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{credits}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none"
          >
            Save Changes
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-700 text-white text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none mt-4"
          >
            Log Out
          </button>
        </div>
      </div>
    </main>
  );
}
