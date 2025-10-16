import { useEffect, useRef, useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const CastVote = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance, selectedAccount } = web3State;
  const voterId = useRef(null);
  const candidateId = useRef(null);
  
  // State to manage voting status and timer
  const [votingStatus, setVotingStatus] = useState("Not Started");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasInProgress, setWasInProgress] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ Full page loading state

  useEffect(() => {
    // Simulate loading state while page initializes
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkVotingPeriod = async () => {
      try {
        const startTimeBigInt = await contractInstance.startTime();
        const endTimeBigInt = await contractInstance.endTime();

        const startTime = Number(startTimeBigInt);
        const endTime = Number(endTimeBigInt);
        const currentTime = Math.floor(Date.now() / 1000);

        const votingStatusFromContract = await contractInstance.getVotingStatus();
        
        if (!votingStatusFromContract) {
          if (wasInProgress) {
            toast((t) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>🛑</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>Voting Stopped</div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>Emergency declared</div>
                </div>
              </div>
            ), {
              duration: 5000,
              style: {
                background: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
                color: '#fff',
                borderRadius: '16px',
                padding: '14px 18px',
                boxShadow: '0 8px 30px rgba(255, 8, 68, 0.35)',
              },
            });
            setWasInProgress(false);
          }
          setVotingStatus("Ended");
          setTimerStarted(false);
          setTimeRemaining(0);
          return;
        }

        // ✅ CLIENT-SIDE status calculation (no need for constant blockchain calls)
        if (currentTime < startTime) {
          setVotingStatus("Not Started");
          setTimeRemaining(startTime - currentTime);
          setWasInProgress(false);
        } else if (currentTime >= startTime && currentTime < endTime) {
          if (votingStatus !== "In Progress") {
            console.log("🎯 Voting started!");
          }
          setVotingStatus("In Progress");
          setTimerStarted(true);
          setTimeRemaining(endTime - currentTime);
          setWasInProgress(true);
        } else {
          if (votingStatus === "In Progress") {
            console.log("⏰ Voting ended!");
          }
          setVotingStatus("Ended");
          setWasInProgress(false);
        }
      } catch (error) {
        console.error("Error fetching voting period:", error);
      }
    };

    if (contractInstance) {
      checkVotingPeriod();
      
      // ✅ OPTIMIZED: Reduced to 5 second polling (balanced performance)
      const pollInterval = setInterval(checkVotingPeriod, 5000);
      
      // Force check when voting period is updated
      const handleVotingUpdate = () => {
        checkVotingPeriod();
      };
      
      window.addEventListener('votingPeriodUpdated', handleVotingUpdate);
      
      return () => {
        clearInterval(pollInterval);
        window.removeEventListener('votingPeriodUpdated', handleVotingUpdate);
      };
    }
  }, [contractInstance]);

  // Check if current wallet has already voted
  useEffect(() => {
    const checkIfVoted = async () => {
      if (!contractInstance || !selectedAccount) return;
      
      try {
        // Get all voters
        const voterList = await contractInstance.getVoterList();
        
        // Check if current wallet address has voted
        const currentVoter = voterList.find(
          voter => voter.voterAddress.toLowerCase() === selectedAccount.toLowerCase()
        );
        
        if (currentVoter && Number(currentVoter.voterCandidateId) > 0) {
          setHasVoted(true);
          toast((t) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px' }}>🚫</span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#fff' }}>Already Voted!</div>
                <div style={{ fontSize: '11px', opacity: 0.85, color: '#fff' }}>One wallet, one vote</div>
              </div>
            </div>
          ), {
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: '#fff',
              borderRadius: '16px',
              padding: '14px 18px',
              boxShadow: '0 8px 30px rgba(245, 87, 108, 0.5)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            },
          });
        } else {
          setHasVoted(false);
        }
      } catch (error) {
        console.error("Error checking vote status:", error);
      }
    };

    checkIfVoted();
  }, [contractInstance, selectedAccount]);

  useEffect(() => {
    let timer;
    if (timerStarted && timeRemaining > 0 && votingStatus === "In Progress") {
      timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(prev - 1, 0)); // Decrease time remaining
      }, 1000);
    } else if (timeRemaining === 0 || votingStatus === "Ended") {
      setTimerStarted(false);
      if (timeRemaining === 0) {
        setVotingStatus("Ended");
      }
    }

    return () => clearInterval(timer); // Cleanup timer on unmount
  }, [timerStarted, timeRemaining, votingStatus]);

  const handleCastVote = async (e) => {
    e.preventDefault();
    
    // Check if already voted
    if (hasVoted) {
      toast((t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🚫</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: '#fff' }}>Already Voted!</div>
            <div style={{ fontSize: '11px', opacity: 0.85, color: '#fff' }}>One wallet, one vote</div>
          </div>
        </div>
      ), {
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: '#fff',
          borderRadius: '16px',
          padding: '14px 18px',
          boxShadow: '0 8px 30px rgba(245, 87, 108, 0.5)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        },
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const voterID = voterId.current.value;
      const candidateID = candidateId.current.value;

      // Make sure voting is in progress before casting a vote
      if (votingStatus !== "In Progress") {
        toast.error("Not active", { icon: "⏸️", duration: 2500 });
        setIsSubmitting(false);
        return;
      }

      // Estimate gas with a small buffer
      let gasLimit;
      try {
        const estimated = await contractInstance.estimateGas.vote(voterID, candidateID);
        // add 20% buffer
        gasLimit = BigInt(Math.ceil(Number(estimated) * 1.2));
      } catch (err) {
        // fallback to a safe gas limit
        gasLimit = BigInt(300000);
      }

      // Determine gas price / legacy compatibility
      let txOverrides = { gasLimit };
      try {
        const provider = contractInstance.provider || new ethers.BrowserProvider(window.ethereum);
        const feeData = await provider.getFeeData();
        if (feeData.gasPrice) {
          txOverrides.gasPrice = feeData.gasPrice;
        } else {
          // fallback
          txOverrides.gasPrice = ethers.parseUnits("2", "gwei");
        }
        // For Holesky compatibility, use legacy tx type if provider complains about EIP-1559
        txOverrides.type = 0;
      } catch (err) {
        // ignore and continue with defaults
      }

      // Send transaction (do not await confirmation yet)
      const txResponse = await contractInstance.vote(voterID, candidateID, txOverrides);

      // Short, friendly toast with tx link
      const txHash = txResponse.hash;
      const txUrl = `https://holesky.etherscan.io/tx/${txHash}`;
      toast((t) => (
        <div className="flex items-center gap-3">
          <span className="text-lg">✅</span>
          <div className="flex flex-col">
            <span style={{ fontWeight: 700 }}>Vote sent</span>
            <a href={txUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, opacity: 0.85 }}>
              View tx
            </a>
          </div>
        </div>
      ), { duration: 4000, id: 'vote-pending' });

      // Optimistic UI update: mark as voted and clear inputs so the user isn't waiting
      setHasVoted(true);
      voterId.current.value = "";
      candidateId.current.value = "";
      setIsSubmitting(false);

      // Wait for confirmation in background and update the toast
      txResponse.wait().then((receipt) => {
        // Replace pending toast with confirmed toast
        toast.dismiss('vote-pending');
        toast.success('Confirmed', { duration: 3000 });
      }).catch((confirmErr) => {
        // If confirmation fails, revert optimistic UI and notify user
        console.error('Tx confirmation error', confirmErr);
        setHasVoted(false);
        toast.dismiss('vote-pending');
        toast.error('Vote failed', { duration: 4000 });
      });

    } catch (error) {
      console.error("Error casting vote:", error);
      // revert optimistic state
      setHasVoted(false);
      // Dismiss any pending
      toast.dismiss('vote-pending');

      // Show concise error messages
      const msg = (error && (error.reason || error.message)) || 'Failed';
      if (msg.toLowerCase().includes('already voted')) {
        setHasVoted(true);
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🚫</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#fff' }}>Already Voted!</div>
              <div style={{ fontSize: '11px', opacity: 0.85, color: '#fff' }}>One wallet, one vote</div>
            </div>
          </div>
        ), {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 8px 30px rgba(245, 87, 108, 0.5)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
          },
        });
      } else if (msg.toLowerCase().includes('user rejected')) {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>⛔</span>
            <span style={{ fontWeight: '600', fontSize: '14px', color: '#fff' }}>Cancelled</span>
          </div>
        ), {
          duration: 2000,
          style: {
            background: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
            color: '#fff',
            borderRadius: '50px',
            padding: '12px 20px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
          },
        });
      } else {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>❌</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#fff' }}>Vote Failed</div>
              <div style={{ fontSize: '11px', opacity: 0.85, color: '#fff' }}>Try again</div>
            </div>
          </div>
        ), {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 8px 30px rgba(245, 87, 108, 0.5)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
          },
        });
      }

      setIsSubmitting(false);
    }
  };

  // Helper function to format time into hours, minutes, and seconds
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return { hours, minutes, secs };
  };

  const { hours, minutes, secs } = formatTime(timeRemaining);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-500 mx-auto mb-6"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-indigo-500 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-2xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Loading Voting Portal...
          </p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we initialize</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="bg-indigo-500/10 backdrop-blur-lg px-6 py-2 rounded-full border border-indigo-500/30">
              <span className="text-indigo-300 text-sm font-bold">🗳️ Voting Portal</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Cast Your Vote
            </span>
          </h1>
          <p className="text-gray-400 font-bold">Make your voice heard in this election</p>
          <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mt-4"></div>
        </div>

        {/* Voting Status Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700 mb-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-300 flex items-center justify-center">
              <svg className="w-6 h-6 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Voting Status
            </h2>
            
            {/* Status Badge */}
            <div className="inline-block">
              <div className={`px-6 py-3 rounded-full font-bold text-lg ${
                hasVoted
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : votingStatus === "Not Started" 
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" 
                  : votingStatus === "In Progress" 
                  ? "bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse" 
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}>
                {hasVoted ? "✅ Already Voted" :
                votingStatus === "Not Started" ? "⏳ Not Started" :
                votingStatus === "In Progress" ? "✅ In Progress" :
                "🔒 Ended"}
              </div>
            </div>

            {/* Already Voted Message */}
            {hasVoted && (
              <div className="mt-4 bg-blue-900/30 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-blue-300 font-semibold">
                    Your vote has been successfully recorded! You cannot vote again.
                  </p>
                </div>
              </div>
            )}

            {/* Timer Display - ✅ Stable rendering based on voting status */}
            {votingStatus === "In Progress" && timeRemaining > 0 && (
              <div className="mt-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-4">
                  Time Remaining
                </h3>
                <div className="flex justify-center gap-3 sm:gap-4">
                  <div className="flex flex-col items-center bg-gradient-to-br from-indigo-600 to-purple-600 p-4 sm:p-6 rounded-xl shadow-2xl min-w-[80px] sm:min-w-[100px] transform transition-transform hover:scale-105">
                    <span className="text-3xl sm:text-4xl text-white font-bold">{String(hours).padStart(2, '0')}</span>
                    <span className="text-xs sm:text-sm text-indigo-200 mt-1">Hours</span>
                  </div>
                  <div className="flex flex-col items-center bg-gradient-to-br from-purple-600 to-pink-600 p-4 sm:p-6 rounded-xl shadow-2xl min-w-[80px] sm:min-w-[100px] transform transition-transform hover:scale-105">
                    <span className="text-3xl sm:text-4xl text-white font-bold">{String(minutes).padStart(2, '0')}</span>
                    <span className="text-xs sm:text-sm text-purple-200 mt-1">Minutes</span>
                  </div>
                  <div className="flex flex-col items-center bg-gradient-to-br from-pink-600 to-red-600 p-4 sm:p-6 rounded-xl shadow-2xl min-w-[80px] sm:min-w-[100px] transform transition-transform hover:scale-105 animate-pulse">
                    <span className="text-3xl sm:text-4xl text-white font-bold">{String(secs).padStart(2, '0')}</span>
                    <span className="text-xs sm:text-sm text-pink-200 mt-1">Seconds</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Voting Form */}
        <form onSubmit={handleCastVote} className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
          <div className="space-y-6">
            {/* Voter ID */}
            <div className="group">
              <label className="flex items-center text-sm font-bold text-gray-300 mb-2">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                  <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Your Voter ID
              </label>
              <input
                type="text"
                ref={voterId}
                placeholder="Enter your voter ID"
                disabled={hasVoted || votingStatus !== "In Progress"}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                  hasVoted || votingStatus !== "In Progress"
                    ? "border-gray-700 bg-gray-900/30 text-gray-600 cursor-not-allowed"
                    : "border-gray-600 bg-gray-900/70 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
                }`}
                required
              />
            </div>

            {/* Candidate ID */}
            <div className="group">
              <label className="flex items-center text-sm font-bold text-gray-300 mb-2">
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Candidate ID
              </label>
              <input
                type="text"
                ref={candidateId}
                placeholder="Enter candidate ID"
                disabled={hasVoted || votingStatus !== "In Progress"}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                  hasVoted || votingStatus !== "In Progress"
                    ? "border-gray-700 bg-gray-900/30 text-gray-600 cursor-not-allowed"
                    : "border-gray-600 bg-gray-900/70 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
                }`}
                required
              />
            </div>

            {/* Info Box */}
            <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-cyan-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-indigo-300 text-sm font-bold mb-1">Voting Guidelines</p>
                  <ul className="text-white text-sm space-y-1">
                    <li>• Voting must be in progress to cast your vote</li>
                    <li>• You can only vote once per election</li>
                    <li>• Double-check IDs before submitting</li>
                    <li>• Your vote is recorded on the blockchain</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={hasVoted || votingStatus !== "In Progress" || isSubmitting}
              className={`w-full font-bold py-4 rounded-xl shadow-2xl transition-all duration-300 transform flex items-center justify-center text-lg ${
                hasVoted
                  ? "bg-blue-700 text-blue-300 cursor-not-allowed"
                  : votingStatus === "In Progress" && !isSubmitting
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 text-white"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              {hasVoted ? (
                <>
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Already Voted - Thank You!
                </>
              ) : isSubmitting ? (
                <>
                  <svg className="animate-spin h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Vote...
                </>
              ) : votingStatus === "In Progress" ? (
                <>
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Your Vote
                </>
              ) : votingStatus === "Not Started" ? (
                "Voting Not Started Yet"
              ) : (
                "Voting Has Ended"
              )}
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm font-bold">
            Need help? 
            <a href="/candidate-list" className="text-indigo-400 hover:text-indigo-300 ml-1 font-bold">
              View Candidate List
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CastVote;
