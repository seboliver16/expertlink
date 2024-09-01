"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { auth, db } from "../app/firebase.config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useUser } from "./UserContext";
import User from "./models/User"; // Make sure this import path is correct

export default function Home() {
  const [userType, setUserType] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, setUser } = useUser();

  

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  

  console.log("LOADED USER", user)

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
            <h3 className="text-xl font-bold text-gray-800 mb-4">Expert Seekers</h3>
            <button
              onClick={() => handleNavigation("/search")}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all"
            >
              Search
            </button>
            {userType === "expert_seeker" ? (
              <>
                <button
                  onClick={() => handleNavigation(`/profile`)}
                  className="w-full text-blue-600 hover:text-blue-800 transition mt-4"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-red-600 hover:text-red-800 transition mt-4"
                >
                  Log Out
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavigation("/auth")}
                className="w-full text-blue-600 hover:text-blue-800 transition mt-4"
              >
                Log In as Seeker
              </button>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Experts</h3>
            <button
              onClick={() => handleNavigation(`/dashboard/${user?.linkedinId}`)}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all"
            >
              Dashboard
            </button>
            {userType === "expert" ? (
              <>
                <button
                  onClick={() => handleNavigation(`/dashboard/${user?.linkedinId}`)}
                  className="w-full text-blue-600 hover:text-blue-800 transition mt-4"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-red-600 hover:text-red-800 transition mt-4"
                >
                  Log Out
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavigation("/auth")}
                className="w-full text-blue-600 hover:text-blue-800 transition mt-4"
              >
                Log In as Expert
              </button>
            )}
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
          <h1 className="text-4xl font-bold text-blue-600">Minerva</h1>
        </div>

        {/* Burger Menu Icon */}
        <div className="block sm:hidden">
          <button onClick={toggleSidebar} className="text-gray-700 focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>

        {/* Enhanced Desktop Navigation with Centered Dropdowns */}
        <nav className="hidden sm:flex items-center justify-end gap-12 flex-grow text-base">
          
          {/* Experts Dropdown */}
          <div className="relative group">
            <button className="text-gray-700 hover:text-blue-600 transition font-semibold">
              Experts
            </button>
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg border border-opacity-50 border-gradient-to-r from-blue-400 to-blue-600 shadow-lg rounded-xl opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out">
              <button
                onClick={() => handleNavigation(`/dashboard/${user?.linkedinId}`)}
                className="text-left w-full px-4 py-2 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 transition-all duration-200 ease-in-out rounded-t-xl"
              >
                Dashboard
              </button>
              {user?.type === "expert" ? (
                <button
                  onClick={() => handleNavigation(`/profile`)}
                  className="text-left w-full px-4 py-2 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 transition-all duration-200 ease-in-out rounded-b-xl"
                >
                  Profile
                </button>
              ) : (
                <button
                  onClick={() => handleNavigation("/auth")}
                  className="text-center w-full px-4 py-2 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 transition-all duration-200 ease-in-out rounded-b-xl"
                >
                  Log In
                </button>
              )}
            </div>
          </div>

          {/* Expert Seekers Dropdown */}
          <div className="relative group">
            <button className="text-gray-700 hover:text-blue-600 transition font-semibold">
              Expert Seekers
            </button>
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg border border-opacity-50 border-gradient-to-r from-blue-400 to-blue-600 shadow-lg rounded-xl opacity-0 group-hover:opacity-100 transform group-hover:scale-100 transition-all duration-300 ease-out w-[100px]">
              <button
                onClick={() => handleNavigation("/search")}
                className="text-center w-full px-4 py-2 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 transition-all duration-200 ease-in-out rounded-t-xl"
              >
                Search
              </button>
              {user?.type === "expert_seeker" ? (
                <button
                  onClick={() => handleNavigation(`/profile`)}
                  className="text-center w-full px-4 py-2 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 transition-all duration-200 ease-in-out rounded-b-xl"
                >
                  Profile
                </button>
              ) : (
                <button
                  onClick={() => handleNavigation("/auth")}
                  className="text-center w-full px-4 py-2 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 transition-all duration-200 ease-in-out rounded-b-xl"
                >
                  Log In
                </button>
              )}
            </div>
          </div>

          <a href="#features" className="text-gray-700 hover:text-blue-600 transition font-semibold">
            Features
          </a>
          <a href="#about" className="text-gray-700 hover:text-blue-600 transition font-semibold">
            About
          </a>
          <a href="#contact" className="text-gray-700 hover:text-blue-600 transition font-semibold">
            Contact
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-20 sm:py-24 px-4">
        <h2 className="text-5xl font-extrabold text-gray-800 mb-6">
          Find Experts for Every Industry
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-12">
          Connect with top industry professionals, send tailored forms, and create project collaborations effortlessly. Modeled after leading firms like AlphaSights and GLG.
        </p>
        <button
          onClick={() => handleNavigation("/auth")}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-transform"
        >
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full max-w-7xl py-24">
        <h3 className="text-3xl font-bold text-gray-800 mb-10 text-center">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
            <h4 className="text-2xl font-semibold text-blue-600 mb-4">Expert Matching</h4>
            <p className="text-gray-600">
              Leverage our algorithm to find the most suitable experts for your specific project needs.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
            <h4 className="text-2xl font-semibold text-blue-600 mb-4">Custom Forms</h4>
            <p className="text-gray-600">
              Create customized forms to gather detailed insights and requirements from potential experts.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
            <h4 className="text-2xl font-semibold text-blue-600 mb-4">Project Management</h4>
            <p className="text-gray-600">
              Manage projects efficiently with our intuitive tools and keep track of all expert interactions.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="w-full max-w-7xl py-24 bg-gray-100 rounded-lg">
        <h3 className="text-3xl font-bold text-gray-800 mb-10 text-center">About Us</h3>
        <p className="text-gray-600 max-w-3xl mx-auto text-center">
          Minerva is your gateway to the worlds leading experts in various industries. Our platform is designed to facilitate seamless connections and collaborations, drawing inspiration from industry giants to bring you the best experience.
        </p>
      </section>

      {/* Footer Section */}
      <footer id="contact" className="flex w-full max-w-7xl items-center justify-between py-6 border-t border-gray-200 mt-24 flex-col sm:flex-row">
        <p className="text-gray-600">&copy; 2024 Minerva. All rights reserved.</p>
        <a href="mailto:contact@minerva.com" className="text-gray-700 hover:text-blue-600 mt-2 sm:mt-0">
          contact@minerva.com
        </a>
      </footer>
    </main>
  );
}
