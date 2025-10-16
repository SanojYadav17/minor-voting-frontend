import { useEffect, useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";

// Function to map enum values to strings
const getGenderString = (genderValue) => {
  switch (genderValue) {
    case "0":
      return "Not Specified";
    case "1":
      return "Male";
    case "2":
      return "Female";
    case "3":
      return "Other";
    default:
      return "Unknown";
  }
};

const GetCandidateList = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [candidateList, setCandidateList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidateList = async () => {
      if (!contractInstance) {
        setLoading(true);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch candidates from blockchain
        const candidates = await contractInstance.getCandidateList();

        // Fetch additional details from MongoDB backend
        let candidatesFromDB = [];
        try {
          const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/candidates`);
          if (response.ok) {
            candidatesFromDB = await response.json();
          }
        } catch (dbError) {
          console.warn("MongoDB fetch failed, using blockchain data only:", dbError);
        }

        // Map and merge blockchain + MongoDB data
        const formattedCandidates = candidates.map(candidate => {
          const candidateAddr = candidate.candidateAddress.toLowerCase();
          // Find matching candidate from MongoDB (uses accountAddress field)
          const dbCandidate = candidatesFromDB.find(c => 
            c.accountAddress?.toLowerCase() === candidateAddr
          );
          
          // Use Cloudinary URL directly from database (already full URL)
          let imageUrl = null;
          if (dbCandidate?.imageName) {
            imageUrl = dbCandidate.imageName; // Cloudinary returns full URL
          }
          
          return {
            candidateId: candidate.candidateId.toString(),
            name: candidate.name,
            party: candidate.party,
            age: candidate.age.toString(),
            gender: candidate.gender.toString(),
            candidateAddress: candidate.candidateAddress,
            votes: candidate.votes.toString(),
            email: dbCandidate?.email || 'N/A',
            imageUrl: imageUrl,
          };
        });

        setCandidateList(formattedCandidates);
      } catch (error) {
        console.error("Error fetching candidate list: ", error);
        setError(error.message || "Failed to load candidate list");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateList();
  }, [contractInstance]);

  // Function to handle image loading
  const getImageUrl = (candidate) => {
    // Cloudinary URL is already full URL from database
    if (candidate.imageUrl) {
      return candidate.imageUrl;
    }
    // Fallback to avatar if no image
    return getAvatarUrl(candidate.name);
  };

  // Generate avatar from candidate name
  const getAvatarUrl = (candidateName) => {
    const name = encodeURIComponent(candidateName);
    return `https://ui-avatars.com/api/?name=${name}&size=150&background=random&color=fff&bold=true`;
  };

  const handleImageError = (e, candidate) => {
    // If Cloudinary image fails, show avatar
    e.target.src = getAvatarUrl(candidate.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-500 mx-auto mb-6"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Loading candidates...
          </p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 text-white p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-red-500/20">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-400 text-xl font-semibold mb-2">Oops! Something went wrong</p>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (candidateList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700">
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-2xl font-semibold text-gray-300 mb-2">No Candidates Yet</p>
          <p className="text-gray-500 text-sm">Be the first to register as a candidate!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8 sm:mb-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Election Candidates
          </h1>
          <p className="text-gray-400 text-sm sm:text-base font-bold">
            Total Candidates: <span className="text-purple-400 font-bold text-lg">{candidateList.length}</span>
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        {candidateList.map((candidate, index) => (
          <div
            key={index}
            className="group bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 border border-gray-700 hover:border-purple-500/50"
          >
            {/* Profile Image with Glow Effect */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
              <img
                className="relative w-32 h-32 sm:w-36 sm:h-36 object-cover rounded-full border-4 border-purple-500 shadow-lg transform transition-transform duration-300 group-hover:scale-110"
                src={getImageUrl(candidate)}
                alt={`${candidate.name}'s image`}
                onError={(e) => handleImageError(e, candidate)}
              />
              {/* Candidate Badge */}
              <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1.5 border-2 border-gray-800">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>

            {/* Name & Party */}
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white group-hover:text-purple-400 transition-colors duration-300">
              {candidate.name}
            </h2>
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-5 py-2 rounded-full mb-4 border border-purple-500/30">
              <p className="text-purple-300 text-base font-semibold">{candidate.party}</p>
            </div>

            {/* Details Card */}
            <div className="bg-gray-900/70 rounded-xl p-5 w-full mb-4 border border-gray-700 group-hover:border-purple-500/30 transition-colors duration-300">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-base flex items-center font-bold">
                    <svg className="w-6 h-6 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                    </svg>
                    ID
                  </span>
                  <span className="text-purple-400 font-bold text-lg">#{candidate.candidateId.toString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-base flex items-center font-bold">
                    <svg className="w-6 h-6 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Age
                  </span>
                  <span className="text-white font-bold text-lg">{candidate.age.toString()} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-base flex items-center font-bold">
                    <svg className="w-6 h-6 mr-2 text-pink-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Gender
                  </span>
                  <span className="text-white font-bold text-lg">{getGenderString(candidate.gender.toString())}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-base flex items-center font-bold">
                    <svg className="w-6 h-6 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Email
                  </span>
                  <span className="text-white font-bold text-sm truncate max-w-[160px]">{candidate.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <span className="text-gray-300 text-base flex items-center font-bold">
                    <svg className="w-6 h-6 mr-2 text-orange-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Votes
                  </span>
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-bold text-base">
                    {candidate.votes.toString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet Address with Copy Button */}
            <div className="w-full bg-gray-900/50 rounded-lg px-4 py-3 border border-gray-700">
              <p className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-sm mb-1 font-bold">Wallet Address</p>
              <div className="flex items-center justify-between">
                <p className="text-gray-300 text-sm font-mono truncate flex-1 font-bold">
                  {candidate.candidateAddress.slice(0, 8)}...{candidate.candidateAddress.slice(-6)}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(candidate.candidateAddress);
                    toast.success("Address copied!");
                  }}
                  className="ml-2 text-purple-400 hover:text-purple-300 transition-colors"
                  title="Copy address"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GetCandidateList;
