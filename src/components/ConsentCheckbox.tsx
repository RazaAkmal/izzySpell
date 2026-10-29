import React from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

// Parental consent checkbox, shared by sign-up and "My Profile" (adding a parent
// email). The wording is what users agree to (stored as consent_version), so it lives
// in one place.
export default function ConsentCheckbox({
  registration,
  error,
  id = "acceptedTerms",
}: {
  registration: UseFormRegisterReturn;
  error?: string;
  id?: string;
}) {
  return (
    <div className="w-full max-w-md">
      <label htmlFor={id} className="flex items-start gap-3 text-sm text-inputText cursor-pointer">
        <input
          id={id}
          type="checkbox"
          className="mt-1 h-4 w-4 flex-shrink-0 cursor-pointer accent-blue"
          {...registration}
        />
        <span>
          I am the parent or legal guardian of the child who will use this account, and I agree to the{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-bold underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-bold underline">
            Privacy Policy
          </a>
        </span>
      </label>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
