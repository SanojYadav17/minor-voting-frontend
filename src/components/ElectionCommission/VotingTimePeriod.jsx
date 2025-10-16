import { useRef, useState, useEffect } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";

const VotingTimePeriod = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;

  const startRef = useRef(null);
  const endRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [votingStatus, setVotingStatus] = useState(null);
  const [isVotingActive, setIsVotingActive] = useState(false);

  // Check voting status to enable/disable form
  useEffect(() => {
    const checkVotingStatus = async () => {
      if (!contractInstance) return;

      try {
        const status = await contractInstance.getVotingStatus();
        const stopVoting = await contractInstance.stopVoting();
        const startTime = await contractInstance.startTime();
        const endTime = await contractInstance.endTime();
        
        const now = Math.floor(Date.now() / 1000);
        
        setVotingStatus(Number(status));
        
        // Voting is active if status is "In Progress" (1) and not stopped
        const isActive = Number(status) === 1 && !stopVoting;
        setIsVotingActive(isActive);
        

      } catch (error) {
        console.error("Error checking voting status:", error);
      }
    };

    checkVotingStatus();
    
    // ✅ OPTIMIZED: Reduced blockchain calls to prevent lag
    // Check every 10 seconds normally
    const interval = setInterval(checkVotingStatus, 10000);
    
    // Force check when voting period is set
    const handleUpdate = () => {
      checkVotingStatus();
    };
    
    window.addEventListener('votingPeriodUpdated', handleUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('votingPeriodUpdated', handleUpdate);
    };
  }, [contractInstance]);

  const handleVotingTime = async (e) => {
    e.preventDefault();
    
    // Check if contract instance is available first
    if (!contractInstance) {
      toast.error("Please connect your wallet first!");
      return;
    }
    
    setLoading(true);

    try {
      const startTime = Math.floor(new Date(startRef.current.value).getTime() / 1000);
      const endTime = Math.floor(new Date(endRef.current.value).getTime() / 1000);
      
      const currentTime = Math.floor(Date.now() / 1000);

      // Validate times
      if (endTime <= startTime) {
        toast.error("End time must be after start time");
        setLoading(false);
        return;
      }

      if (startTime < currentTime - 300) { // Allow 5 minutes in past for timezone issues
        toast.error("Start time cannot be in the past");
        setLoading(false);
        return;
      }

      // ✅ Calculate durations (contract expects durations, not absolute times!)
      const startDuration = startTime - currentTime; // Seconds from now to start
      const endDuration = endTime - startTime;       // Seconds from start to end



      // Estimate gas first
      let gasEstimate;
      try {
        gasEstimate = await contractInstance.setVotingPeriod.estimateGas(startDuration, endDuration);
      } catch (estimateError) {
        console.error("Gas estimation failed:", estimateError);
        if (estimateError.message.includes("Only election commissioner")) {
          toast.error("Only Election Commissioner can set voting period");
          setLoading(false);
          return;
        }
        // Use default gas if estimation fails
        gasEstimate = 300000n;
      }

      // Send transaction with proper gas limit
      toast.loading("Please confirm transaction in MetaMask...", { id: "voting-period" });
      
      const tx = await contractInstance.setVotingPeriod(startDuration, endDuration, {
        gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
      });
      
      toast.loading(`Transaction submitted! Waiting for confirmation...`, { id: "voting-period" });
      
      // Wait for confirmation with timeout
      try {
        const receipt = await Promise.race([
          tx.wait(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Confirmation timeout')), 60000)
          )
        ]);
        
        
        if (receipt.status === 1) {
          // Success
          toast.success("✅ Voting period set successfully!", { id: "voting-period", duration: 3000 });
          
          // Reset form
          if (startRef.current) startRef.current.value = "";
          if (endRef.current) endRef.current.value = "";
          
          // Don't reload - just update UI
          
          // Dispatch custom event to refresh voting status
          window.dispatchEvent(new Event('votingPeriodUpdated'));
          
        } else {
          throw new Error("Transaction failed");
        }
      } catch (waitError) {
        if (waitError.message === 'Confirmation timeout') {
          toast.success("Transaction sent! Status will update automatically.", { id: "voting-period", duration: 5000 });
          
          // Reset form
          if (startRef.current) startRef.current.value = "";
          if (endRef.current) endRef.current.value = "";
          
          // Trigger status update
          window.dispatchEvent(new Event('votingPeriodUpdated'));
        } else {
          throw waitError;
        }
      }
      
    } catch (error) {
      console.error("Transaction error:", error);
      
      if (error.code === "ACTION_REJECTED" || error.code === 4001) {
        toast.error("Transaction rejected by user", { id: "voting-period" });
      } else if (error.message.includes("Only election commissioner")) {
        toast.error("Only Election Commissioner can set voting period", { id: "voting-period" });
      } else if (error.message.includes("insufficient funds")) {
        toast.error("Insufficient ETH for gas fees", { id: "voting-period" });
      } else if (error.message.includes("nonce")) {
        toast.error("Transaction nonce error. Please try again.", { id: "voting-period" });
      } else {
        toast.error(`Error: ${error.message.slice(0, 50)}...`, { id: "voting-period" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Warning when voting is active */}
      {isVotingActive && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="text-yellow-400 font-semibold text-sm">⚠️ Voting is Currently Active</h4>
              <p className="text-yellow-200 text-xs mt-1">
                You cannot set a new voting period while voting is in progress.
              </p>
              <p className="text-yellow-300 text-xs mt-1">
                Wait for the current period to end or use Emergency Stop first.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form - disabled when voting is active */}
      <form onSubmit={handleVotingTime} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`text-base font-bold flex items-center ${isVotingActive ? 'text-gray-500' : 'text-white'}`}>
              📅 Start Time:
            </label>
            <input
              type="datetime-local"
              ref={startRef}
              disabled={isVotingActive}
              onChange={(e) => {
                // ✅ Auto-close calendar when date is selected
                if (e.target.value) {
                  e.target.blur();
                }
              }}
              className={`mt-2 p-4 w-full text-base font-semibold ${
                isVotingActive 
                  ? 'bg-gray-900 text-gray-600 cursor-not-allowed border-gray-700' 
                  : 'bg-gray-700 text-white border-2 border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              } rounded-lg transition`}
              style={!isVotingActive ? { colorScheme: 'dark', filter: 'brightness(1.3) contrast(1.1)' } : {}}
              required
            />
          </div>
          <div>
            <label className={`text-base font-bold flex items-center ${isVotingActive ? 'text-gray-500' : 'text-white'}`}>
              📅 End Time:
            </label>
            <input
              type="datetime-local"
              ref={endRef}
              disabled={isVotingActive}
              onChange={(e) => {
                // ✅ Auto-close calendar when date is selected
                if (e.target.value) {
                  e.target.blur();
                }
              }}
              className={`mt-2 p-4 w-full text-base font-semibold ${
                isVotingActive 
                  ? 'bg-gray-900 text-gray-600 cursor-not-allowed border-gray-700' 
                  : 'bg-gray-700 text-white border-2 border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              } rounded-lg transition`}
              style={!isVotingActive ? { colorScheme: 'dark', filter: 'brightness(1.3) contrast(1.1)' } : {}}
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || isVotingActive}
          className={`w-full px-4 py-2 font-bold ${
            loading || isVotingActive
              ? "bg-gray-500 cursor-not-allowed" 
              : "bg-blue-500 hover:bg-blue-600"
          } text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
        >
          {loading 
            ? "Setting..." 
            : isVotingActive 
              ? "🔒 Voting Active - Cannot Change Period" 
              : "Set Voting Period"}
        </button>
      </form>
    </div>
  );
};

export default VotingTimePeriod;
