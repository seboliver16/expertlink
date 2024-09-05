"use client";

import React, { useState, useEffect } from "react";
import { useWindowSize } from "react-use";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { useUser } from "@/app/UserContext"; // Assuming there's a UserContext to access the user's data

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

const ProjectSuccess = () => {
  const { width, height } = useWindowSize();
  const router = useRouter();
  const { user } = useUser(); // Get the user's LinkedIn ID from context
  const [countdown, setCountdown] = useState(10); // Countdown starts from 10 seconds

  useEffect(() => {
    // Countdown timer
    const interval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    // Redirect to dashboard after 10 seconds
    const timeout = setTimeout(() => {
      router.push(`/dashboard/${user?.linkedinId}`);
    }, 10000);

    // Clear intervals and timeouts on component unmount
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router, user?.linkedinId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Confetti effect */}
      <Confetti width={width} height={height} numberOfPieces={500} recycle={false} />

      {/* Success message */}
      <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-green-500 mb-6">Success!</h1>
        <p className="text-lg text-gray-800 mb-4">
          Your questions have been successfully submitted to the client.
        </p>
        <p className="text-md text-gray-600 mb-4">
          We will email you the status of your project. Please refer to your dashboard as necessary.
        </p>

        {/* Countdown timer */}
        <p className="text-md text-gray-700 font-medium mb-4">
          Redirecting you to your dashboard in <span className="text-blue-600">{countdown}</span> seconds...
        </p>

        {/* Button to redirect immediately */}
        <button
          onClick={() => router.push(`/dashboard/${user?.linkedinId}`)}
          className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-full hover:bg-blue-600 transition-all"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
};

export default ProjectSuccess;
