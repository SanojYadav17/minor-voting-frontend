import { useState, useEffect } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";

const DisplayResult = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [winner, setWinner] = useState({
    id: null,
    name: "No winner declared",
    address: null,
    votes: 0,
  });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get winner details
        const winnerId = await contractInstance.winnerId();
        const winnerName = await contractInstance.winnerName();
        const winnerAddress = await contractInstance.winnerAddress();
        const winnerVotes = await contractInstance.winnerVotes();

        setWinner({
          id: winnerId.toString(),
          name: winnerName,
          address: winnerAddress,
          votes: winnerVotes.toString(),
        });

        // Get all candidates with votes
        const candidateList = await contractInstance.getCandidateList();
        
        // Sort by votes (highest to lowest)
        const sortedCandidates = [...candidateList].sort((a, b) => 
          Number(b.votes) - Number(a.votes)
        );
        
        setCandidates(sortedCandidates);
      } catch (error) {
        toast.error("Error: Getting Results");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (contractInstance) {
      fetchData();
      
      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [contractInstance]);

  // Get total votes
  const totalVotes = candidates.reduce((sum, candidate) => sum + Number(candidate.votes), 0);

  // Get gender string
  const getGenderString = (genderValue) => {
    switch (genderValue.toString()) {
      case "0": return "Not Specified";
      case "1": return "Male";
      case "2": return "Female";
      case "3": return "Other";
      default: return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Winner Card (if declared) */}
      {winner.id && winner.id !== "0" && (
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/50 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            🏆 Winner Announced!
          </h3>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 space-y-3">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <span className="text-white font-bold">Name:</span>
              <span className="text-xl font-bold text-white">{winner.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <span className="text-white font-bold">Candidate ID:</span>
              <span className="text-lg font-bold text-yellow-400">#{winner.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-bold">Votes Received:</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {winner.votes}
              </span>
            </div>
          </div>
          <div className="mt-4 bg-gradient-to-r from-red-900/40 to-orange-900/40 rounded-lg px-4 py-3 border border-red-500/40">
            <p className="text-orange-300 text-sm mb-2 font-bold">Winner's Wallet Address:</p>
            <p className="text-gray-200 text-sm font-mono break-all font-bold">{winner.address}</p>
          </div>
        </div>
      )}

      {/* Live Vote Count for All Candidates */}
      <div className="bg-gray-800/30 backdrop-blur rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            📊 Live Vote Count
          </h3>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-bold">Total Votes Cast</p>
            <p className="text-2xl font-bold text-white">{totalVotes}</p>
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-400">No candidates registered yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate, index) => {
              const votePercentage = totalVotes > 0 
                ? ((Number(candidate.votes) / totalVotes) * 100).toFixed(1) 
                : 0;
              
              return (
                <div 
                  key={candidate.candidateId.toString()} 
                  className={`bg-gray-900/50 backdrop-blur rounded-xl p-4 border transition-all duration-300 hover:scale-[1.02] ${
                    index === 0 && totalVotes > 0
                      ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
                      : 'border-gray-700 hover:border-orange-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {/* Rank Badge */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 && totalVotes > 0
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {index === 0 && totalVotes > 0 ? '👑' : `#${index + 1}`}
                      </div>
                      
                      {/* Candidate Info */}
                      <div>
                        <h4 className="text-lg font-bold text-white">{candidate.name}</h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-300 font-bold">
                          <span>🎭 {candidate.party}</span>
                          <span>•</span>
                          <span>ID: {candidate.candidateId.toString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Vote Count */}
                    <div className="text-right">
                      <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        {candidate.votes.toString()}
                      </div>
                      <div className="text-sm text-gray-300 font-bold">
                        {votePercentage}% votes
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mb-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        index === 0 && totalVotes > 0
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-500'
                      }`}
                      style={{ width: `${votePercentage}%` }}
                    ></div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-gray-300 font-bold">
                      <span>👤 {getGenderString(candidate.gender)}</span>
                      <span>🎂 {candidate.age.toString()} yrs</span>
                    </div>
                    <div className="text-gray-300 font-mono font-bold">
                      {candidate.candidateAddress.slice(0, 6)}...{candidate.candidateAddress.slice(-4)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Auto-refresh indicator */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300 flex items-center justify-center font-bold">
            <svg className="w-4 h-4 mr-2 animate-spin text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            🔄 Auto-refreshing every 10 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisplayResult;
