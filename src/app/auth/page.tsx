"use client";

import { useState } from "react";
import { auth } from "../firebase.config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("Account created successfully! Please sign in.");
        setIsSignUp(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/search");
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
              <div>
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
