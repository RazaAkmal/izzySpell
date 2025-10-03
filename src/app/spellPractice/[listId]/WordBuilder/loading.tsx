import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-lightBlue via-skyBlue to-lightGreen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-purple mb-2">Loading Word Builder...</h2>
        <p className="text-darkBlue">Building your word challenge! 🧩</p>
      </div>
    </div>
  );
}