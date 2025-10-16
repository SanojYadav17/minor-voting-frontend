import { useEffect, useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";

// Function to map gender value to string
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

const GetVoterList = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [voterList, setVoterList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVoterList = async () => {
      if (!contractInstance) {
        setLoading(true);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch the voter list from the smart contract
        const voters = await contractInstance.getVoterList();

        // Fetch additional details from MongoDB backend
        let votersFromDB = [];
        try {
          const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/voters`);
          if (response.ok) {
            votersFromDB = await response.json();
          }
        } catch (dbError) {
          console.warn("MongoDB fetch failed, using blockchain data only:", dbError);
        }

        // Map the fetched data and merge with MongoDB data
        const formattedVoters = voters.map(voter => {
          const voterAddr = voter.voterAddress.toLowerCase();
          // Find matching voter from MongoDB by address (MongoDB uses accountAddress field)
          const dbVoter = votersFromDB.find(v => 
            v.accountAddress?.toLowerCase() === voterAddr
          );
          
          // Use Cloudinary URL directly from database (already full URL)
          let imageUrl = null;
          if (dbVoter?.imageName) {
            imageUrl = dbVoter.imageName; // Cloudinary returns full URL
          }
          
          return {
            voterId: voter.voterId.toString(),
            name: voter.name,
            age: voter.age.toString(),
            gender: voter.gender.toString(),
            voterAddress: voter.voterAddress,
            email: dbVoter?.email || 'N/A',
            imageUrl: imageUrl,
          };
        });

        setVoterList(formattedVoters);
      } catch (error) {
        console.error("Error fetching voter list: ", error);
        setError(error.message || "Failed to load voter list");
      } finally {
        setLoading(false);
      }
    };

    fetchVoterList();
  }, [contractInstance]);

  // Function to handle image loading
  const getImageUrl = (voter) => {
    // Cloudinary URL is already full URL from database
    if (voter.imageUrl) {
      return voter.imageUrl;
    }
    // Fallback to avatar if no image
    return getAvatarUrl(voter.name);
  };

  // Generate avatar from voter name
  const getAvatarUrl = (voterName) => {
    const name = encodeURIComponent(voterName);
    return `https://ui-avatars.com/api/?name=${name}&size=150&background=random&color=fff&bold=true`;
  };

  const handleImageError = (e, voter) => {
    // If Cloudinary image fails, show avatar
    e.target.src = getAvatarUrl(voter.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mx-auto mb-6"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Loading voters...
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
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (voterList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700">
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-2xl font-semibold text-gray-300 mb-2">No Voters Yet</p>
          <p className="text-gray-500 text-sm">Be the first to register as a voter!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8 sm:mb-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent py-2 leading-tight">
            Registered Voters
          </h1>
          <p className="text-gray-400 text-sm sm:text-base font-bold">
            Total Voters: <span className="text-blue-400 font-bold text-lg">{voterList.length}</span>
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        {voterList.map((voter, index) => (
          <div
            key={index} 
            className="group bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 border border-gray-700 hover:border-blue-500/50"
          >
            {/* Profile Image with Glow Effect */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
              <img
                className="relative w-32 h-32 sm:w-36 sm:h-36 object-cover rounded-full border-4 border-blue-500 shadow-lg transform transition-transform duration-300 group-hover:scale-110"
                src={getImageUrl(voter)}
                alt={`${voter.name}'s image`}
                onError={(e) => handleImageError(e, voter)}
              />
              {/* Verified Badge */}
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-gray-800">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Name */}
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors duration-300">
              {voter.name}
            </h2>

            {/* Details Card */}
            <div className="bg-gray-900/70 rounded-xl p-5 w-full mb-4 border border-gray-700 group-hover:border-blue-500/30 transition-colors duration-300">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-base flex items-center font-bold">
                    <svg className="w-6 h-6 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                    </svg>
                    ID
                  </span>
                  <span className="text-blue-400 font-bold text-lg">#{voter.voterId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-base flex items-center font-bold">
                    <svg className="w-6 h-6 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Age
                  </span>
                  <span className="text-white font-bold text-lg">{voter.age} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-base flex items-center font-bold">
                    <svg className="w-6 h-6 mr-2 text-pink-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Gender
                  </span>
                  <span className="text-white font-bold text-lg">{getGenderString(voter.gender)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-base flex items-center font-bold">
                    <svg className="w-6 h-6 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Email
                  </span>
                  <span className="text-white font-bold text-sm truncate max-w-[160px]">{voter.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Wallet Address with Copy Button */}
            <div className="w-full bg-gray-900/50 rounded-lg px-4 py-3 border border-gray-700">
              <p className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-sm mb-1 font-bold">Wallet Address</p>
              <div className="flex items-center justify-between">
                <p className="text-gray-300 text-sm font-mono truncate flex-1 font-bold">
                  {voter.voterAddress.slice(0, 8)}...{voter.voterAddress.slice(-6)}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(voter.voterAddress);
                    toast.success("Address copied!");
                  }}
                  className="ml-2 text-green-400 hover:text-green-300 transition-colors"
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

export default GetVoterList;
