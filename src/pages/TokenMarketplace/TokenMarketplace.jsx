import { useWeb3Context } from "../../context/useWeb3Context";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import BuyToken from "../../components/TokenMarketPlace/BuyToken";
import SellToken from "../../components/TokenMarketPlace/SellToken";
import TokenBalance from "../../components/TokenMarketPlace/TokenBalance";
import TokenPrice from "../../components/TokenMarketPlace/TokenPrice";
import FundMarketplace from "../../components/Admin/FundMarketplace";
import { toast } from "react-hot-toast";
import tokenMarketplaceAbi from "../../constant/tokenMarketplaceAbi.json";
import erc20abi from "../../constant/erc20Abi.json";

const TokenMarketplace = () => {
  const [tokenMarketplaceInstance, setTokenMarketplaceInstance] = useState(null);
  const [erc20ContractInstance, setErc20ContractInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const { web3State } = useWeb3Context();
  const { signer, provider } = web3State;

  useEffect(() => {
    const erc20TokenInit = () => {
      try {
        // Get ERC20 contract address from environment variables
        const contractAddress = import.meta.env.VITE_ERC20_TOKEN_ADDRESS;
        
        if (!contractAddress) {
          throw new Error("ERC20 token address not found in environment variables");
        }
        
        const erc20ContractInstance = new ethers.Contract(contractAddress, erc20abi, provider);
        setErc20ContractInstance(erc20ContractInstance);
      } catch (error) {
        toast.error("Error initializing ERC20 contract.");
        console.error(error);
      }
    };
    provider && erc20TokenInit();
  }, [provider]);

  useEffect(() => {
    const tokenMarketplaceInit = () => {
      try {
        // Get Token Marketplace contract address from environment variables
        const tokenMarketplaceContractAddress = import.meta.env.VITE_TOKEN_MARKETPLACE_ADDRESS;
        
        if (!tokenMarketplaceContractAddress) {
          throw new Error("Token Marketplace address not found in environment variables");
        }
        
        const tokenMarketplaceInstance = new ethers.Contract(tokenMarketplaceContractAddress, tokenMarketplaceAbi, signer);
        setTokenMarketplaceInstance(tokenMarketplaceInstance);
      } catch (error) {
        toast.error("Error initializing Token Marketplace.");
        console.error(error);
      }
    };
    signer && tokenMarketplaceInit();
  }, [signer]);

  useEffect(() => {
    // Simulate loading state while contracts initialize
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 text-white p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-emerald-500 mx-auto mb-6"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-emerald-500 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-2xl font-semibold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            Loading Token Marketplace...
          </p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we initialize</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 text-white px-4 py-12">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="bg-emerald-500/10 backdrop-blur-lg px-6 py-2 rounded-full border border-emerald-500/30">
              <span className="text-emerald-300 text-sm font-semibold">🪙 Digital Asset Exchange</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 bg-clip-text text-transparent">
              Token Marketplace
            </span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Buy and sell CK tokens securely</p>
          <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-green-500 mx-auto rounded-full mt-4"></div>
        </div>

        {/* Token Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Token Balance */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-emerald-500/20">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-br from-emerald-600 to-green-600 p-3 rounded-xl mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                Token Balance
              </h2>
            </div>
            <TokenBalance erc20ContractInstance={erc20ContractInstance} />
          </div>

          {/* Token Price */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300 hover:shadow-green-500/20">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-br from-green-600 to-teal-600 p-3 rounded-xl mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                Token Price
              </h2>
            </div>
            <TokenPrice contractInstance={tokenMarketplaceInstance} />
          </div>
        </div>

        {/* Trading Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Buy Token */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-br from-emerald-600 to-green-600 p-3 rounded-xl mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                Buy Tokens
              </h2>
            </div>
            <BuyToken contractInstance={tokenMarketplaceInstance} />
          </div>

          {/* Sell Token */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700 hover:border-red-500/50 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-br from-red-600 to-orange-600 p-3 rounded-xl mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Sell Tokens
              </h2>
            </div>
            <SellToken erc20ContractInstance={erc20ContractInstance} contractInstance={tokenMarketplaceInstance} />
          </div>
        </div>

        {/* Admin: Fund Marketplace */}
        <div className="mb-12">
          <FundMarketplace />
        </div>

        {/* How It Works Section */}
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700">
          <h2 className="text-3xl font-bold text-center mb-2">
            <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <div className="h-1 w-16 bg-gradient-to-r from-emerald-500 to-green-500 mx-auto rounded-full mb-8"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-emerald-500 to-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">
                  1
                </div>
                <h3 className="text-lg font-bold text-emerald-300">Connect Wallet</h3>
              </div>
              <p className="text-gray-400 text-sm">Link your wallet to access the marketplace and manage your tokens securely.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">
                  2
                </div>
                <h3 className="text-lg font-bold text-green-300">Check Balance</h3>
              </div>
              <p className="text-gray-400 text-sm">View your current CK token balance and ETH holdings in real-time.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-teal-500/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">
                  3
                </div>
                <h3 className="text-lg font-bold text-teal-300">Buy Tokens</h3>
              </div>
              <p className="text-gray-400 text-sm">Purchase CK tokens using ETH at the current market rate instantly.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-emerald-500 to-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">
                  4
                </div>
                <h3 className="text-lg font-bold text-emerald-300">Sell Tokens</h3>
              </div>
              <p className="text-gray-400 text-sm">Convert your CK tokens back to ETH whenever you need liquidity.</p>
            </div>

            {/* Step 5 */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">
                  5
                </div>
                <h3 className="text-lg font-bold text-green-300">Track Transactions</h3>
              </div>
              <p className="text-gray-400 text-sm">Monitor all your purchases and sales in your transaction history.</p>
            </div>

            {/* Step 6 */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-teal-500/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">
                  6
                </div>
                <h3 className="text-lg font-bold text-teal-300">Use for Voting</h3>
              </div>
              <p className="text-gray-400 text-sm">Utilize your CK tokens to participate in the democratic voting process.</p>
            </div>
          </div>
        </div>

        {/* Contract Info */}
        <div className="mt-8 bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-bold text-green-500 mb-3">Contract Addresses:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <span className="text-blue-400 font-bold">ERC20:</span>
              <p className="text-gray-300 font-mono break-all mt-1 font-bold">{import.meta.env.VITE_ERC20_TOKEN_ADDRESS}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <span className="text-blue-400 font-bold">Marketplace:</span>
              <p className="text-gray-300 font-mono break-all mt-1 font-bold">{import.meta.env.VITE_TOKEN_MARKETPLACE_ADDRESS}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenMarketplace;
