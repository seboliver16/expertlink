"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.config";
import Image from "next/image";
import { useUser } from "../../UserContext";
import Project from "@/app/models/project";
import User from "@/app/models/User";

const DashboardPage = () => {
  const { user, setUser } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [countdown, setCountdown] = useState(15); // Add countdown state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthorization = async () => {
      setLoading(true);
      if (user) {
        if (!user.name) {
          await fetchAndSetUserName();
        }
        if (user.type !== "expert") {
          setUnauthorized(true);
          setLoading(false);
          startCountdown();
        } else {
          await fetchProjects();
          setLoading(false);
        }
      } else {
        setUnauthorized(true);
        setLoading(false);
        startCountdown();
      }
    };

    const fetchAndSetUserName = async () => {
      if (user?.linkedinId) {
        const docRef = doc(db, "experts", user.linkedinId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const name = docSnap.data()?.name;
          if (name) {
            const updatedUser = new User(
              user.id,
              name,
              user.email,
              user.type,
              user.linkedinId,
              user.projects,
              user.credits,
              user.status,
              user.projectsCompleted,
              user.lifetimeIncome
            );
            setUser(updatedUser);
            await updateDoc(doc(db, "users", user.email), { name });
          }
        }
      }
    };

    const startCountdown = () => {
      const countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown > 0) {
            return prevCountdown - 1;
          } else {
            clearInterval(countdownInterval);
            router.push("/auth");
            return 0;
          }
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    };

    const fetchProjects = async () => {
      if (user && user.type === "expert") {
        try {
          const projectsRef = collection(db, `projects/${user.email}/userProjects`);
          const projectsSnapshot = await getDocs(projectsRef);
          const projectsList = projectsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return new Project(
              doc.id,
              data.title,
              data.description,
              data.questions,
              new Map(Object.entries(data.expertStatus)),
              new Map(Object.entries(data.seekerStatus)),
              data.categories,
              data.askingPrice,
              data.availability
            );
          });
          setProjects(projectsList);
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      }
    };

    checkAuthorization();
  }, [user, router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Opportunity":
        return "🟡"; // Yellow dot for Opportunity
      case "Answered":
        return "🟢"; // Green dot for Answered
      case "Scheduled":
        return "🔵"; // Blue dot for Scheduled
      case "Completed":
        return "🟣"; // Purple dot for Completed
      default:
        return "⚪"; // White dot for undefined status
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-grey-100 to-grey-300 p-6">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <Image src="/logo.png" alt="Minerva Logo" width={80} height={80} className="mx-auto" />
          <h1 className="text-3xl font-bold text-gray-800 mt-6">
            Welcome to Minerva!
          </h1>
          <p className="text-lg text-gray-700 mt-4">
            It seems you dont have access to this expert dashboard.
          </p>
          <p className="text-lg text-gray-700 mt-2">
            If you believe this is an error or if youre trying to claim your expert account, click the button below.
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="mt-6 bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-all"
          >
            Claim Your Expert Account
          </button>
          <p className="text-lg text-gray-700 mt-4">
            Not an expert? Please navigate to our home page for more information.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-2 bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-all"
          >
            Go to Home Page
          </button>
          <p className="text-sm text-gray-600 mt-8">
            Redirecting you to the login page in <span className="font-bold">{countdown}</span> seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gray-50 p-4 sm:p-8">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex flex-col p-6 space-y-6">
          <button
            onClick={toggleSidebar}
            className="text-gray-700 focus:outline-none self-end"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Navigation</h3>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all mt-4"
            >
              Profile
            </button>
            <button
              onClick={() => router.push("/logout")}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-all mt-4"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for Sidebar */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 z-40"
        ></div>
      )}

      {/* Header Section */}
      <header className="flex w-full max-w-7xl items-center justify-between py-4 sm:py-8">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Minerva Logo" width={50} height={50} />
          <h1 className="text-4xl font-bold text-blue-600">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`${user!.linkedinId}/profile`)}
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white cursor-pointer transition-all"
          >
            {user?.name?.[0] || "?"}
          </button>
        </div>
      </header>

      {/* Main Content Section */}
      <section className="flex-grow w-full max-w-7xl flex flex-col items-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user?.name}!</h2>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {projects.map((project) => (
              <div key={project.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">{project.title}</h2>
                  <span className="text-lg">{getStatusIcon(Array.from(project.expertStatus.values())[0])}</span>
                </div>
                <p className="text-gray-600 mt-2">{project.description}</p>
                <button
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all"
                >
                  View Project
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xl font-semibold text-gray-700">No projects found.</p>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
