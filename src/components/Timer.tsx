import React, { useState, useEffect, useCallback } from 'react';
import { useTimer } from 'react-timer-hook';

interface TimerProps {
  initialSeconds: number;
  isRunning: boolean;
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialSeconds, isRunning, onTimeUp }) => {
  // Calculate expiry time based on initialSeconds - wrapped in useCallback to avoid dependency issues
  const getExpiryTimestamp = useCallback(() => {
    const time = new Date();
    time.setSeconds(time.getSeconds() + initialSeconds);
    return time;
  }, [initialSeconds]);
  
  // Initial expiry timestamp
  const [expiryTimestamp, setExpiryTimestamp] = useState(getExpiryTimestamp());
  
  // Using react-timer-hook for optimized timer handling
  const {
    seconds,
    minutes,
    restart,
    pause
  } = useTimer({ 
    expiryTimestamp, 
    onExpire: onTimeUp, 
    autoStart: false
  });
  
  // Update expiry time when initialSeconds changes
  useEffect(() => {
    if (isRunning) {
      const newExpiryTime = getExpiryTimestamp();
      setExpiryTimestamp(newExpiryTime);
      restart(newExpiryTime);
    }
  }, [initialSeconds, isRunning, restart, getExpiryTimestamp]);
  
  // Control timer based on isRunning prop
  useEffect(() => {
    if (isRunning) {
      // If timer should be running, restart
      const newExpiryTime = getExpiryTimestamp();
      setExpiryTimestamp(newExpiryTime);
      restart(newExpiryTime, true); // true means autostart
    } else {
      // Pause the timer when not running
      pause();
    }
  }, [isRunning, getExpiryTimestamp, restart, pause]);

  // Format time as MM:SS
  const formatTime = () => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate percentage for color indication
  const getColorClass = () => {
    const totalSeconds = minutes * 60 + seconds;
    const percentage = (totalSeconds / initialSeconds) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`font-mono text-2xl font-bold ${getColorClass()} transition-colors duration-300`}>
      {formatTime()}
    </div>
  );
};

export default Timer;
