'use client';

import { useState } from "react";

import { signIn } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default function SignInPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (email: string, password: string) => {
    setError("");
    setIsLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        // Redirect on success
        window.location.href = "/dashboard";
      }
    } catch (e: any) {
      setError(e?.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
      

        <LoginForm onLogin={handleSubmit} error={error} isLoading={isLoading} className="mt-6" />
      </div>
    </div>
  );
}