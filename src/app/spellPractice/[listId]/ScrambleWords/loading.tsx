import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-skyBlue">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-blue mb-2">Loading Scramble Words...</h2>
        <p className="text-gray-600">Getting your spelling game ready! 🎮</p>
      </div>
    </div>
  );
}
