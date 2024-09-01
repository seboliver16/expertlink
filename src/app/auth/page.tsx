"use client";

import { useState } from "react";
import { auth, db } from "../firebase.config";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileType, setProfileType] = useState<"expert" | "expert_seeker" | "">("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (isSignUp) {
        if (profileType === "expert" && !linkedinUrl) {
          setError("LinkedIn URL is required for experts.");
          return;
        }

        let linkedinId = "";
        if (profileType === "expert") {
          const linkedinMatch = linkedinUrl.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/);
          if (linkedinMatch) {
            linkedinId = linkedinMatch[1];
          } else {
            setError("Invalid LinkedIn URL.");
            return;
          }
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData = {
          email: user.email,
          type: profileType,
          createdAt: new Date(),
          ...(profileType === "expert_seeker" && { projects: {}, credits: 0 }),
          ...(profileType === "expert" && { linkedinUrl, linkedinId, status: {}, projectsCompleted: 0, lifetimeIncome: 0 }),
        };

        // Use email as the document ID
        const docId = user.email!;
        await setDoc(doc(db, "users", docId), userData);

        setMessage("Account created successfully! Please sign in.");
        setIsSignUp(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);

        // Check if the user document exists
        const docRef = doc(db, "users", email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log("User data:", userData);  // Log the user data to debug
          if (userData.type === "expert_seeker") {
            router.push("/search");
          } else if (userData.type === "expert") {
            router.push(`/dashboard/${userData.linkedinId}`);
          } else {
            setError("User type is not recognized.");
          }
        } else {
          setError("User document not found.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to authenticate.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Please check your inbox.");
      setResetPassword(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">Minerva</h1>
          <p className="mt-2 text-gray-600">
            {resetPassword ? "Reset your password" : isSignUp ? "Create an account" : "Sign in to your account"}
          </p>
        </div>
        {error && <p className="text-red-600 text-center">{error}</p>}
        {message && <p className="text-green-600 text-center">{message}</p>}
        <form onSubmit={resetPassword ? handleResetPassword : handleSignIn} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm">
            <div className="mb-4">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            {!resetPassword && (
              <div className="mb-4">
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            )}
            {isSignUp && (
              <div className="mb-6">
                <div className="relative">
                  <select
                    id="profile-type"
                    value={profileType}
                    onChange={(e) => setProfileType(e.target.value as "expert" | "expert_seeker")}
                    className="block w-full pl-4 pr-10 py-3 text-base text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg bg-white shadow-sm appearance-none transition-all duration-200 ease-in-out"
                  >
                    <option value="" disabled>Select Type of User</option> {/* Placeholder Option */}
                    <option value="expert_seeker">Expert Seeker</option>
                    <option value="expert">Expert</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 01.707.293l5 5a1 1 0 01-1.414 1.414L10 5.414 5.707 9.707A1 1 0 014.293 8.293l5-5A1 1 0 0110 3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            {isSignUp && profileType === "expert" && (
              <div className="mb-6">
                <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                <input
                  id="linkedin-url"
                  name="linkedin-url"
                  type="url"
                  required
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="appearance-none rounded w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://www.linkedin.com/in/your-profile"
                />
              </div>
            )}
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              {resetPassword ? "Send Reset Email" : isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </form>
        {!resetPassword && (
          <div className="text-sm text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:underline"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        )}
        <div className="text-sm text-center">
          <button
            onClick={() => {
              setResetPassword(!resetPassword);
              setIsSignUp(false);
            }}
            className="text-blue-600 hover:underline"
          >
            {resetPassword ? "Back to Sign In" : "Forgot your password?"}
          </button>
        </div>
      </div>
    </main>
  );
}
