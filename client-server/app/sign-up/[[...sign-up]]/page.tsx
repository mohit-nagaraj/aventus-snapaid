import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { HeartPulse } from "lucide-react";
import { clerkAppearance } from "@/app/clerk-theme";

export const metadata: Metadata = {
  title: "Sign Up | SnapAid",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col items-center text-center mb-8">
          <HeartPulse className="h-10 w-10 text-purple-600 mb-3" />
          <h1 className="text-3xl font-bold text-purple-900">
            Create your account
          </h1>
          <p className="text-purple-600 mt-2">
            Get started with personalized health assessments
          </p>
        </div>
        <div className="rounded-xl border border-purple-100 bg-white p-8 shadow-sm">
          <SignUp appearance={clerkAppearance} />
        </div>
      </div>
    </div>
  );
}
