import { useState, useEffect } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";

const EmergencyDeclare = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [isVotingStopped, setIsVotingStopped] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check voting status on component mount and when contract changes
  useEffect(() => {
    const checkStopVotingStatus = async () => {
      if (!contractInstance) return;
      
      try {
        const stopped = await contractInstance.stopVoting();
        setIsVotingStopped(stopped);
      } catch (error) {
        console.error("Error checking stop voting status:", error);
      }
    };

    checkStopVotingStatus();
    
    // Listen for voting period updates
    const handleUpdate = () => {
      checkStopVotingStatus();
    };
    
    window.addEventListener('votingPeriodUpdated', handleUpdate);
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(checkStopVotingStatus, 10000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('votingPeriodUpdated', handleUpdate);
    };
  }, [contractInstance]);

  const emergencyStop = async () => {
    try {
      if (!contractInstance) {
        toast.error("Please connect your wallet first!");
        return;
      }
      
      setLoading(true);
      toast.loading("Stopping voting...", { id: "emergency" });
      
      const tx = await contractInstance.StopVoting();
      await tx.wait(); // Wait for confirmation
      
      setIsVotingStopped(true);
      toast.success("✅ Voting has been stopped!", { id: "emergency" });
      
      // Trigger status update
      window.dispatchEvent(new Event('votingPeriodUpdated'));
    } catch (error) {
      console.error("Emergency stop error:", error);
      
      if (error.message.includes("Only election commissioner")) {
        toast.error("Only Election Commissioner can stop voting", { id: "emergency" });
      } else if (error.code === "ACTION_REJECTED") {
        toast.error("Transaction rejected by user", { id: "emergency" });
      } else {
        toast.error("Error: Failed to stop voting", { id: "emergency" });
      }
    } finally {
      setLoading(false);
    }
  };

  const resumeVoting = async () => {
    try {
      if (!contractInstance) {
        toast.error("Please connect your wallet first!");
        return;
      }
      
      setLoading(true);
      toast.loading("Resuming voting...", { id: "resume" });
      
      const tx = await contractInstance.resumeVoting();
      await tx.wait(); // Wait for confirmation
      
      setIsVotingStopped(false);
      toast.success("✅ Voting has been resumed!", { id: "resume" });
      
      // Trigger status update
      window.dispatchEvent(new Event('votingPeriodUpdated'));
    } catch (error) {
      console.error("Resume voting error:", error);
      
      if (error.message.includes("Only election commissioner")) {
        toast.error("Only Election Commissioner can resume voting", { id: "resume" });
      } else if (error.message.includes("Voting is not stopped")) {
        toast.error("Voting is already active", { id: "resume" });
      } else if (error.message.includes("Voting period has ended")) {
        toast.error("Cannot resume - voting period has ended. Set a new period.", { id: "resume" });
      } else if (error.code === "ACTION_REJECTED") {
        toast.error("Transaction rejected by user", { id: "resume" });
      } else {
        toast.error("Error: Failed to resume voting", { id: "resume" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {isVotingStopped ? (
        <div className="space-y-2">
          <div className="px-4 py-2 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm font-bold">⚠️ Voting is currently STOPPED</p>
            <p className="text-red-300 text-xs mt-1 font-bold">Click Resume to continue voting</p>
          </div>
          <button 
            onClick={resumeVoting} 
            disabled={loading}
            className={`px-4 py-2 w-full ${loading ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'} text-white font-bold rounded-lg shadow-lg transition`}
          >
            {loading ? "Resuming..." : "▶️ Resume Voting"}
          </button>
        </div>
      ) : (
        <button 
          onClick={emergencyStop} 
          disabled={loading}
          className={`px-4 py-2 w-full ${loading ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-600'} text-white font-bold rounded-lg shadow-lg transition`}
        >
          {loading ? "Stopping..." : "⛔ Emergency Stop Voting"}
        </button>
      )}
    </div>
  );
};

export default EmergencyDeclare;
