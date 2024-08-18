"use client"

import Image from "next/image";
import { useEffect, useState } from "react";
import { auth } from "../app/firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push("/search");
    } else {
      router.push("/auth");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gray-50 p-8">
      {/* Header Section */}
      <header className="flex w-full max-w-7xl items-center justify-between py-8">
        <div className="flex items-center gap-3">
          <Image src="/Minerva.svg" alt="Minerva Logo" width={50} height={50} />
          <h1 className="text-4xl font-bold text-blue-600">Minerva</h1>
        </div>
        <nav className="hidden md:flex gap-10">
          <a href="#features" className="text-lg text-gray-700 hover:text-blue-600 transition">
            Features
          </a>
          <a href="#about" className="text-lg text-gray-700 hover:text-blue-600 transition">
            About
          </a>
          <a href="#contact" className="text-lg text-gray-700 hover:text-blue-600 transition">
            Contact
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-20">
        <h2 className="text-5xl font-extrabold text-gray-800 mb-6">
          Find Experts for Every Industry
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-12">
          Connect with top industry professionals, send tailored forms, and create project collaborations effortlessly. Modeled after leading firms like AlphaSights and GLG.
        </p>
        <button
          onClick={handleGetStarted}
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
      <footer id="contact" className="flex w-full max-w-7xl items-center justify-between py-6 border-t border-gray-200 mt-24">
        <p className="text-gray-600">&copy; 2024 Minerva. All rights reserved.</p>
        <a href="mailto:contact@minerva.com" className="text-gray-700 hover:text-blue-600">
          contact@minerva.com
        </a>
      </footer>
    </main>
  );
}
