import { useState, useEffect, useMemo } from "react";
import { useVotingStatus } from "../../context/VotingStatusContext";
import { toast } from "react-hot-toast";

const VotingStatus = () => {
  // ✅ Use shared voting status context
  const { votingStatus, startTime, endTime, isLoading } = useVotingStatus();
  const [countdown, setCountdown] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progressPercent, setProgressPercent] = useState(100); // ✅ Separate state for smooth progress

  const statusMap = {
    0: "Not Started",
    1: "In Progress",
    2: "Ended"
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Not Started":
        return "text-yellow-400";
      case "In Progress":
        return "text-green-400";
      case "Ended":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  // ✅ Memoize formatted time to prevent unnecessary recalculations
  const formatTimeRemaining = useMemo(() => {
    return (seconds) => {
      if (seconds <= 0) return "0s";
      
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      let result = [];
      if (days > 0) result.push(`${days}d`);
      if (hours > 0) result.push(`${hours}h`);
      if (minutes > 0) result.push(`${minutes}m`);
      if (secs > 0 || result.length === 0) result.push(`${secs}s`);
      
      return result.join(" ");
    };
  }, []);

  // Update countdown every second (CLIENT-SIDE, no blockchain calls)
  useEffect(() => {
    const updateCountdown = () => {
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (votingStatus === "Not Started" && startTime > 0) {
        const timeToStart = Number(startTime) - currentTime;
        const newTimeRemaining = Math.max(0, timeToStart);
        
        // ✅ Only update if changed significantly (prevent micro-updates)
        if (Math.abs(newTimeRemaining - timeRemaining) >= 1) {
          setTimeRemaining(newTimeRemaining);
          if (timeToStart > 0) {
            setCountdown(`Starts in: ${formatTimeRemaining(timeToStart)}`);
          } else {
            setCountdown("Starting...");
            // Force status refresh when time reaches
            if (timeToStart === 0 || timeToStart === -1) {
              window.dispatchEvent(new Event('forceVotingStatusCheck'));
            }
          }
        }
      } else if (votingStatus === "In Progress" && endTime > 0) {
        const timeToEnd = Number(endTime) - currentTime;
        const newTimeRemaining = Math.max(0, timeToEnd);
        
        // ✅ Update progress bar percentage
        const totalDuration = Number(endTime) - Number(startTime);
        const elapsed = currentTime - Number(startTime);
        const newPercent = Math.max(0, Math.min(100, ((totalDuration - elapsed) / totalDuration) * 100));
        
        // ✅ Only update if changed
        if (Math.abs(newTimeRemaining - timeRemaining) >= 1) {
          setTimeRemaining(newTimeRemaining);
          setProgressPercent(newPercent);
          
          if (timeToEnd > 0) {
            setCountdown(`Ends in: ${formatTimeRemaining(timeToEnd)}`);
          } else {
            setCountdown("Ending...");
            // Force status refresh when time reaches
            if (timeToEnd === 0 || timeToEnd === -1) {
              window.dispatchEvent(new Event('forceVotingStatusCheck'));
            }
          }
        }
      } else {
        if (countdown !== "" || timeRemaining !== 0) {
          setCountdown("");
          setTimeRemaining(0);
          setProgressPercent(0);
        }
      }
    };

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(countdownInterval);
  }, [votingStatus, startTime, endTime, timeRemaining, countdown, formatTimeRemaining]);

  // ✅ Component now uses shared context - no more individual blockchain calls!
  // All voting status management is centralized in VotingStatusContext

  return (
    <div className="space-y-3">
      {/* Status Display */}
      <div className="flex items-center space-x-3">
        <h3 className="text-lg font-bold">Status:</h3>
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-gray-400 font-bold">Loading...</span>
          </div>
        ) : (
          <span className={`font-bold text-xl ${getStatusColor(votingStatus)}`}>
            {votingStatus}
          </span>
        )}
      </div>

      {/* Countdown Timer */}
      {!isLoading && countdown && votingStatus !== "Ended" && (
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-300 font-semibold text-sm">
                {countdown}
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              votingStatus === "Not Started" 
                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" 
                : "bg-green-500/20 text-green-300 border border-green-500/30"
            }`}>
              {votingStatus === "Not Started" ? "⏳ Upcoming" : "🔴 Live"}
            </div>
          </div>
          
          {/* Progress Bar - ✅ Stable rendering with state-based percentage */}
          {votingStatus === "In Progress" && endTime > startTime && (
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 transition-all duration-1000 ease-linear"
                  style={{
                    width: `${progressPercent}%`
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voting Period Times */}
      {!isLoading && startTime > 0 && endTime > 0 && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-800/50 border border-gray-700 rounded p-2">
            <div className="text-gray-400 text-[10px] uppercase tracking-wide font-bold">Start Time</div>
            <div className="text-gray-200 font-bold mt-1">
              {new Date(Number(startTime) * 1000).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded p-2">
            <div className="text-gray-400 text-[10px] uppercase tracking-wide font-bold">End Time</div>
            <div className="text-gray-200 font-bold mt-1">
              {new Date(Number(endTime) * 1000).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingStatus;
