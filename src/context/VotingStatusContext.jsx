import { createContext, useContext, useState, useEffect } from "react";
import { useWeb3Context } from "./useWeb3Context";

const VotingStatusContext = createContext();

export const useVotingStatus = () => {
  const context = useContext(VotingStatusContext);
  if (!context) {
    throw new Error("useVotingStatus must be used within VotingStatusProvider");
  }
  return context;
};

export const VotingStatusProvider = ({ children }) => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  
  const [votingStatus, setVotingStatus] = useState("Not Started");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const statusMap = {
    0: "Not Started",
    1: "In Progress",
    2: "Ended"
  };

  // Fetch voting status from blockchain
  const fetchVotingStatus = async () => {
    if (!contractInstance) {
      setIsLoading(false);
      return;
    }

    try {
      const [startTimeBigInt, endTimeBigInt, currentStatus] = await Promise.all([
        contractInstance.startTime(),
        contractInstance.endTime(),
        contractInstance.getVotingStatus(),
      ]);

      const start = Number(startTimeBigInt);
      const end = Number(endTimeBigInt);
      const status = statusMap[currentStatus] || "Not Started";

      setStartTime(start);
      setEndTime(end);
      setVotingStatus(status);
      setLastUpdated(Date.now());
      

    } catch (error) {
      console.warn("⚠️ Could not fetch voting status:", error.message);
      // Silently fail - don't disrupt UI
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Client-side status calculation (instant UI updates without re-renders)
  useEffect(() => {
    if (!startTime || !endTime) return;

    const checkAndUpdateStatus = () => {
      const currentTime = Math.floor(Date.now() / 1000);
      
      let newStatus = "Not Started";
      if (currentTime >= startTime && currentTime <= endTime) {
        newStatus = "In Progress";
      } else if (currentTime > endTime) {
        newStatus = "Ended";
      }
      
      // ✅ CRITICAL: Only update state if status actually changed
      if (newStatus !== votingStatus) {
        setVotingStatus(newStatus);
        
        // Verify with blockchain after client-side change
        setTimeout(fetchVotingStatus, 2000);
      }
    };

    // Check immediately
    checkAndUpdateStatus();

    // ✅ OPTIMIZED: Only check at critical moments
    const currentTime = Math.floor(Date.now() / 1000);
    const timeToStart = Number(startTime) - currentTime;
    const timeToEnd = Number(endTime) - currentTime;

    let checkInterval;
    
    if (timeToStart > 0 && timeToStart <= 120) {
      // Within 2 minutes of start - check every 2 seconds
      checkInterval = setInterval(checkAndUpdateStatus, 2000);
    } else if (votingStatus === "In Progress" || (timeToEnd > 0 && timeToEnd <= 120)) {
      // During voting or within 2 minutes of end - check every 2 seconds
      checkInterval = setInterval(checkAndUpdateStatus, 2000);
    } else {
      // Otherwise check every 10 seconds
      checkInterval = setInterval(checkAndUpdateStatus, 10000);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [startTime, endTime, votingStatus]);

  // ✅ Periodic blockchain sync (every 60 seconds - reduced frequency to prevent circuit breaker)
  useEffect(() => {
    if (!contractInstance) return;

    // Initial fetch with delay
    const initialTimer = setTimeout(fetchVotingStatus, 1000);
    
    // Sync every 60 seconds (reduced from 30)
    const syncInterval = setInterval(fetchVotingStatus, 60000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(syncInterval);
    };
  }, [contractInstance]);

  // ✅ Listen for manual updates
  useEffect(() => {
    const handleUpdate = () => {
      fetchVotingStatus();
    };

    window.addEventListener('votingPeriodUpdated', handleUpdate);
    window.addEventListener('forceVotingStatusCheck', handleUpdate);
    
    return () => {
      window.removeEventListener('votingPeriodUpdated', handleUpdate);
      window.removeEventListener('forceVotingStatusCheck', handleUpdate);
    };
  }, [contractInstance]);

  const value = {
    votingStatus,
    startTime,
    endTime,
    isLoading,
    lastUpdated,
    refresh: fetchVotingStatus,
  };

  return (
    <VotingStatusContext.Provider value={value}>
      {children}
    </VotingStatusContext.Provider>
  );
};
