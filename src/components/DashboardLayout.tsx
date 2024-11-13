// components/DashboardLayout.tsx

import React, { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  showFooter?: boolean; // Prop to control footer visibility
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, showFooter = true }) => {
  return (
    <div className="bg-blue-100 min-h-screen flex flex-col"> 
      {/* Light blue background and minimum height to fill the screen */}
      <header className="bg-white p-4 shadow-md"> 
        {/* White background, padding, and shadow for the header */}
        <div className="container mx-auto flex justify-between items-center"> 
          {/* Center content within a max-width container */}
          <div className="text-xl font-bold text-blue">IzzySpell</div> {/* App title */}
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-300"> 
              {/* Placeholder for user avatar */}
            </div>
            <div className="ml-2 font-medium">Sarah</div> {/* User name */}
            <div className="ml-2">{/* Placeholder for dropdown icon */}</div> 
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-grow p-4"> 
        {/* Main content area with flex-grow to take available space */}
        {children}
      </main>

      {showFooter && ( // Conditionally render the footer
        <footer className="bg-white p-4 shadow-md mt-4"> 
          {/* White background, padding, shadow, and top margin for the footer */}
          <div className="container mx-auto text-center text-gray-600">
            {/* Footer content */}
          </div>
        </footer>
      )}
    </div>
  );
};

export default DashboardLayout;