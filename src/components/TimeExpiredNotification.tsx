import React, { useEffect, useState } from 'react';

interface TimeExpiredNotificationProps {
  show: boolean;
  onClose: () => void;
}

const TimeExpiredNotification: React.FC<TimeExpiredNotificationProps> = ({
  show,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Show for a shorter time (800ms), then trigger the close action
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 200); // Allow shorter time for fade-out animation
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);
  
  if (!show || !isVisible) return null;
  
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg max-w-md text-center transform transition-transform duration-200">
        <p className="text-xl font-bold">Time&apos;s Up!</p>
        <p className="text-sm">Moving to next word...</p>
      </div>
    </div>
  );
};

export default TimeExpiredNotification;
