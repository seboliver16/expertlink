"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Project from "@/app/models/project";
import { db } from "@/app/firebase.config";
import { useUser } from "@/app/UserContext";
import DatePicker from "react-datepicker";
import TimePicker from "react-time-picker";
import 'react-datepicker/dist/react-datepicker.css';
import 'react-time-picker/dist/TimePicker.css';

const ProjectDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  const { user } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState<{ date: Date; time: string }[]>([]);
  const [price, setPrice] = useState<number>(350); // User editable price
  const [pricingRecommendations, setPricingRecommendations] = useState<number>(350); // Recommended price
  const [pricingFactors, setPricingFactors] = useState<{ factor: string; value: number }[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!projectId) {
          setError("No project ID provided.");
          setLoading(false);
          return;
        }

        const projectRef = doc(db, `projects/${user!.email}/userProjects/${projectId}`);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const data = projectSnap.data();
          const loadedProject = new Project(
            projectSnap.id,
            data.title,
            data.description,
            "",
            data.questions,
            new Map(Object.entries(data.expertStatus)),
            new Map(Object.entries(data.seekerStatus)),
            data.categories,
            data.askingPrice,
            data.availability
          );
          setProject(loadedProject);
        } else {
          setError("Project not found.");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
    fetchPricingRecommendations(user!.linkedinId); // Fetch pricing recommendations
  }, [projectId, user]);

  const fetchPricingRecommendations = async (linkedinId: string) => {
    try {
      // Fetch expert data from Firebase based on linkedinId
      const expertRef = doc(db, `experts/${linkedinId}`);
      const expertSnap = await getDoc(expertRef);

      if (expertSnap.exists()) {
        const expertData = expertSnap.data();

        // Extract relevant expert data
        const { title, yearsOfExperience } = expertData;

        // Calculate price based on real expert stats
        const basePrice = 125; // Base price for all roles, will adjust per factors
        const titleFactor = calculateTitleFactor(title); // Factor based on title
        const experienceFactor = calculateExperienceFactor(yearsOfExperience); // Factor based on YOE
        const urgencyFactor = 0; // Urgency is assumed to be 0 by default

        // Combine factors into total price, ensuring middle management equals 350
        const totalPrice = basePrice + titleFactor + experienceFactor + urgencyFactor;

        // Set pricing factors
        const factors = [
          { factor: "Base Price", value: basePrice },
          { factor: "Title", value: titleFactor },
          { factor: "Experience (Years)", value: experienceFactor },
          { factor: "Urgency", value: urgencyFactor },
        ];

        // Set state with calculated values
        setPricingFactors(factors);
        setPricingRecommendations(totalPrice); // Set recommended price
        setPrice(totalPrice);
      } else {
        console.error("Expert not found");
      }
    } catch (error) {
      console.error("Error fetching expert data:", error);
    }
  };

  // Helper function to calculate pricing based on title
  const calculateTitleFactor = (title: string): number => {
    const titlePricing: { [key: string]: number } = {
      Engineer: 100,     // Lower than middle management
      Analyst: 100,      // Lower than middle management
      Manager: 150,      // This makes the total 350 (200 base + 150 for Manager)
      "Senior Manager": 200, // Higher than middle management
      VP: 250,           // Even higher
      Director: 300,     // High level
      CXO: 350,          // Highest level
      default: 150,      // Default to middle management
    };

    const normalizedTitle = normalizeTitle(title);
    return titlePricing[normalizedTitle] || titlePricing["default"];
  };

  // Helper function to normalize title for broader role categories
  const normalizeTitle = (title: string): string => {
    const titleLower = title.toLowerCase();

    if (titleLower.includes("engineer")) return "Engineer";
    if (titleLower.includes("analyst")) return "Analyst";
    if (titleLower.includes("manager") && titleLower.includes("senior")) return "Senior Manager";
    if (titleLower.includes("manager")) return "Manager";
    if (titleLower.includes("vp") || titleLower.includes("vice president")) return "VP";
    if (titleLower.includes("director")) return "Director";
    if (titleLower.includes("cxo") || titleLower.includes("chief")) return "CXO";

    return "default";
  };

  // Helper function to calculate pricing based on years of experience
  const calculateExperienceFactor = (yearsOfExperience: number): number => {
    if (yearsOfExperience >= 20) return 100;
    if (yearsOfExperience >= 10) return 75;
    if (yearsOfExperience >= 5) return 50;
    return 25;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(Number(e.target.value));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (time: string | null) => {
    if (time) {
      setSelectedTime(time);
    }
  };

  const addAvailability = () => {
    if (selectedDate && selectedTime) {
      setAvailability([...availability, { date: selectedDate, time: selectedTime }]);
      setSelectedDate(null); // Clear after adding
      setSelectedTime(""); // Clear after adding
    }
  };

  const handleRemoveAvailability = (index: number) => {
    const newAvailability = availability.filter((_, i) => i !== index);
    setAvailability(newAvailability);
  };

  
  const handleSubmit = async () => {
    if (!user || !project) return;

    // Check for minimum availabilities
    if (availability.length < 3) {
      alert("Please provide at least 3 availabilities in Eastern Time.");
      return;
    }

    // Check if all questions are answered
    const textAreas = document.querySelectorAll('textarea');
    const unanswered = Array.from(textAreas).some(textarea => textarea.value.trim() === '');
    if (unanswered) {
      alert("Please answer all the questions.");
      return;
    }

    // Check if the price is valid (not 0 and not more than 1500)
    if (price <= 0 || price > 1500) {
      alert("Please set a price between 1 and 1500.");
      return;
    }

    try {
      const projectRef = doc(db, `projects/${user.email}/userProjects/${project.id}`);
      await updateDoc(projectRef, {
        price,
        availability,
      });
      // Navigate to success page on successful submission
      router.push(`success`);
    } catch (error) {
      console.error("Error updating project:", error);
    }
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-xl font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-xl font-semibold text-gray-700">Project not found.</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Left Section */}
      <div className="w-full lg:w-2/5 p-8 text-sm bg-white rounded-none lg:rounded-l-lg lg:rounded-none">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">{project.title}</h1>
          <p className="text-gray-700 mt-2">{project.description}</p>
        </div>

        {/* Minerva Pricing Recommendations */}
<div className="mb-6 p-1 rounded-lg bg-gradient-to-r from-blue-200 via-blue-700 to-blue-200 animate-border-shine">
  <div className="p-6 bg-white rounded-lg shadow-lg relative">
    {/* Minerva Logo */}
    <div className="absolute top-4 left-4">
      <img src="/logo.png" alt="Minerva Logo" className="w-12 h-12" />
    </div>

    <div className="pl-16"> {/* Add padding to avoid overlap with the logo */}
      <h2 className="text-xl font-semibold text-gray-800">Minerva Pricing Recommendations</h2>
      <p className="text-gray-600 mt-2">
        Based on industry standards and your experience, the recommended price is{" "}
        <span className="font-bold text-gray-900">${pricingRecommendations}</span> per hour. Adjust your rate as needed.
      </p>
      <p className="text-sm text-gray-500 mt-1">
        Factors: Experience, Industry, Urgency, Market Rates
      </p>
    </div>
  </div>
</div>

{/* Pricing Breakdown Table */}
<div className="mb-6 p-1 rounded-lg bg-gradient-to-r from-blue-200 via-blue-700 to-blue-200   animate-border-shine">
  <div className="p-6 bg-white rounded-lg shadow-lg">
    <h2 className="text-lg font-semibold text-gray-800">Pricing Breakdown</h2>
    <table className="w-full mt-4 border-collapse">
      <thead>
        <tr>
          <th className="text-left p-2 text-gray-700 border-b border-gray-200">Factor</th>
          <th className="text-right p-2 text-gray-700 border-b border-gray-200">Amount</th>
        </tr>
      </thead>
      <tbody>
        {pricingFactors.map((factor, index) => (
          <tr key={index}>
            <td className="p-2 text-gray-600">{factor.factor}</td>
            <td className="p-2 text-right text-gray-600">${factor.value}</td>
          </tr>
        ))}
        <tr>
          <td className="p-2 text-gray-800 font-semibold">Total</td>
          <td className="p-2 text-right text-gray-800 font-semibold">
            ${pricingRecommendations}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>



      </div>

      {/* Right Section */}
      <div className="w-full lg:w-3/5 p-8 bg-white rounded-none lg:rounded-r-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Input</h2>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Your Price ($)</label>
            <input
              type="number"
              value={price}
              onChange={handlePriceChange}
              step="25"
              min="0"
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <h3 className="text-gray-700 font-semibold">Availability</h3>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              minDate={new Date()}
              maxDate={new Date(new Date().setDate(new Date().getDate() + 14))} // Limit to 14 days
              placeholderText="Select a date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
            />
            {selectedDate && (
              <TimePicker
                value={selectedTime}
                onChange={handleTimeChange}
                disableClock
                className="w-full mt-2"
              />
            )}
            <button
              onClick={addAvailability}
              disabled={!selectedDate || !selectedTime}
              className="ml-4 mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Add Availability
            </button>
          </div>

          <div className="mt-4">
            {availability.map((item, index) => (
              <div key={index} className="flex items-center mb-2">
                <span>{item.date.toDateString()} - {item.time}</span>
                <button
                  onClick={() => handleRemoveAvailability(index)}
                  className="ml-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <h3 className="text-gray-700 font-semibold">Questions</h3>
            {project.questions.map((question, index) => (
              <div key={index} className="mb-4">
                <label className="block text-gray-600 mb-2">{question}</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                ></textarea>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-all"
        >
          Submit Details
        </button>
      </div>
    </main>
  );
};

export default ProjectDetailsPage;
