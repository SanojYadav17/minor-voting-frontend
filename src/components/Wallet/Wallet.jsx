import { useEffect, useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import erc20abi from "../../constant/erc20Abi.json";

const HomePage = () => {
  const { handleWallet, disconnectWallet, web3State, isLoading } = useWeb3Context();
  const { selectedAccount, networkName, provider } = web3State;
  const [userTokenBalance, setUserTokenBalance] = useState(null);
  const [erc20ContractInstance, setErc20ContractInstance] = useState(null);
  const navigateTo = useNavigate();

  // Redirect to home after connecting wallet - but only once
  useEffect(() => {
    if (selectedAccount && window.location.pathname !== '/') {
      navigateTo('/');
    }
  }, [selectedAccount, navigateTo]);

  // Initialize ERC20 contract when provider is available
  useEffect(() => {
    if (!provider) return;

    const initializeErc20Contract = () => {
      try {
        // Get ERC20 contract address from environment variables
        const contractAddress = import.meta.env.VITE_ERC20_TOKEN_ADDRESS;
        
        if (!contractAddress) {
          throw new Error("ERC20 token address not found in environment variables");
        }
        
        const contract = new ethers.Contract(contractAddress, erc20abi, provider);
        setErc20ContractInstance(contract);
      } catch (error) {
        toast.error("Error initializing ERC20 contract.");
        console.error(error);
      }
    };

    initializeErc20Contract();
  }, [provider]);

  // Fetch token balance when contract instance and account are available
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!erc20ContractInstance || !selectedAccount) return;

      try {
        const tokenBalanceWei = await erc20ContractInstance.balanceOf(selectedAccount);
        const tokenBalanceEth = ethers.formatEther(tokenBalanceWei); 
        setUserTokenBalance(tokenBalanceEth);
      } catch (error) {
        toast.error("Error: Getting Token Balance");
        console.error(error);
      }
    };

    fetchTokenBalance();
  }, [erc20ContractInstance, selectedAccount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-4xl mx-auto space-y-6">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center space-x-3 bg-blue-500/10 backdrop-blur-lg px-6 py-3 rounded-full border border-blue-500/30">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z"/>
              </svg>
              <span className="text-blue-200 text-base font-extrabold tracking-wide">Blockchain-Powered Voting</span>
            </div>
          </div>

                    <style>{`
            @keyframes gradient-flow {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            @keyframes subtle-glow {
              0%, 100% { 
                text-shadow: 
                  0 0 20px rgba(59, 130, 246, 0.6),
                  0 0 40px rgba(139, 92, 246, 0.4),
                  0 0 60px rgba(236, 72, 153, 0.3);
              }
              50% { 
                text-shadow: 
                  0 0 25px rgba(59, 130, 246, 0.8),
                  0 0 50px rgba(139, 92, 246, 0.6),
                  0 0 75px rgba(236, 72, 153, 0.5);
              }
            }
            @keyframes float-gentle {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
          `}</style>
          <h1 
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight"
            style={{ 
              animation: 'float-gentle 4s ease-in-out infinite, subtle-glow 3s ease-in-out infinite'
            }}
          >
            <span 
              className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              style={{
                backgroundSize: '200% 200%',
                animation: 'gradient-flow 4s ease infinite',
                filter: 'brightness(1.2) contrast(1.1)'
              }}
            >
              Welcome to Voting DApp
            </span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Participate in a transparent and secure voting process powered by blockchain technology. 
            <span className="block mt-2 text-blue-400 font-semibold">Connect your wallet to get started!</span>
          </p>
          
          {/* Connect/Disconnect Button */}
          <div className="mt-8">
            <button
              onClick={selectedAccount ? disconnectWallet : handleWallet}
              disabled={isLoading}
              className={`group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 ${
                selectedAccount 
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              } rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="relative z-10 flex items-center">
                {!isLoading && (
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={selectedAccount ? "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" : "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"} />
                  </svg>
                )}
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : selectedAccount ? "Disconnect Wallet" : "Connect Wallet"}
              </span>
            </button>
          </div>
        </div>

        {/* Connected Wallet Card */}
        {selectedAccount && (
          <div className="w-full max-w-2xl mx-auto mb-12 animate-fadeIn">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Connected Wallet
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-bold">Active</span>
                </div>
              </div>

              {/* Account Address */}
              <div className="bg-gray-900/70 rounded-xl p-4 mb-4 border border-gray-700">
                <p className="text-base mb-2 flex items-center font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-cyan-300 transition-all duration-300 cursor-default">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2.5">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                  Account Address
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-mono text-sm sm:text-base break-all font-bold">{selectedAccount}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedAccount);
                      toast.success("Address copied!");
                    }}
                    className="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Network */}
              <div className="bg-gray-900/70 rounded-xl p-4 mb-4 border border-gray-700">
                <p className="text-base mb-2 flex items-center font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition-all duration-300 cursor-default">
                  <svg className="w-5 h-5 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2.5">
                    <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                  </svg>
                  Network
                </p>
                <p className="text-white font-bold text-xl">{networkName}</p>
              </div>

              {/* Token Balance */}
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/30">
                <p className="text-base mb-2 flex items-center font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent hover:from-green-300 hover:to-emerald-300 transition-all duration-300 cursor-default">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20" strokeWidth="2.5">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  CK Token Balance
                </p>
                <p className="text-white font-bold text-2xl">
                  {userTokenBalance !== null ? (
                    <span className="text-white">
                      {parseFloat(userTokenBalance).toFixed(2)} CK
                    </span>
                  ) : (
                    <span className="text-gray-400">Loading...</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-3">
              How It Works
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { 
                step: 1, 
                title: "Connect Wallet", 
                desc: "Connect your MetaMask wallet to the dApp securely.",
                icon: "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4",
                color: "blue"
              },
              { 
                step: 2, 
                title: "Buy CK Tokens", 
                desc: "Purchase tokens from the marketplace to participate.",
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                color: "green",
                link: "/token-marketplace"
              },
              { 
                step: 3, 
                title: "Cast Your Vote", 
                desc: "Vote for your preferred candidate with CK tokens.",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
                color: "purple"
              },
              { 
                step: 4, 
                title: "View Results", 
                desc: "Track election status and results transparently.",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                color: "pink"
              }
            ].map((item) => (
              <div 
                key={item.step}
                className="group bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                onClick={item.link ? () => navigateTo(item.link) : undefined}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg`}>
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
