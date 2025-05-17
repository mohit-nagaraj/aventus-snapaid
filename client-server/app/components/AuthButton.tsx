"use client";

import { 
  SignInButton, 
  SignUpButton, 
  SignedIn, 
  SignedOut, 
  UserButton 
} from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { clerkAppearance } from '../clerk-theme';

export const AuthButtons = () => {
  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Get Started
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton appearance={clerkAppearance} />
      </SignedIn>
    </div>
  );
};