import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3Context } from "../../context/useWeb3Context";
import AnnounceWinner from "../../components/ElectionCommission/AnnounceWinner";
import DisplayResult from "../../components/ElectionCommission/DisplayResult";
import EmergencyDeclare from "../../components/ElectionCommission/EmergencyDeclare";
import VotingStatus from "../../components/ElectionCommission/VotingStatus";
import VotingTimePeriod from "../../components/ElectionCommission/VotingTimePeriod";

const ElectionCommission = () => {
  const token = localStorage.getItem("token");
  const navigateTo = useNavigate();
  const { web3State } = useWeb3Context();
  const { contractInstance, selectedAccount } = web3State;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigateTo("/");
    }
  }, [navigateTo, token]);

  useEffect(() => {
    // Simulate loading state while contract initializes
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 text-white p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-red-500 mx-auto mb-6"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-red-500 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-2xl font-semibold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            Loading Election Commission...
          </p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we initialize</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 text-white px-4 py-12">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="bg-red-500/10 backdrop-blur-lg px-6 py-2 rounded-full border border-red-500/30">
              <span className="text-red-300 text-sm font-bold">🏛️ Administrative Control</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Election Commission
            </span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base font-bold">Manage and oversee the entire election process</p>
          <div className="h-1 w-24 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full mt-4"></div>
        </div>

        {/* Dashboard Grid */}
        <div className="space-y-6">
          {/* Wallet Connection Warning */}
          {!contractInstance && (
            <div className="bg-yellow-500/10 backdrop-blur-lg border border-yellow-500/50 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-xl font-bold text-yellow-500">Wallet Not Connected</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Please connect your MetaMask wallet to access Election Commission functions.
              </p>
              <button
                onClick={() => navigateTo("/")}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg transition"
              >
                Go to Home & Connect Wallet
              </button>
            </div>
          )}

          {/* Voting Status */}
          <section className="group bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-gray-600 hover:border-red-500/70 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-red-600 to-orange-600 p-3 rounded-xl mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Voting Status
              </h2>
            </div>
            <VotingStatus />
          </section>

          {/* Display Results */}
          <section className="group bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-gray-600 hover:border-orange-500/70 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-orange-600 to-yellow-600 p-3 rounded-xl mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Display Results
              </h2>
            </div>
            <DisplayResult />
          </section>

          {/* Voting Time Period */}
          <section className="group bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-gray-600 hover:border-yellow-500/70 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-yellow-600 to-amber-600 p-3 rounded-xl mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                Set Voting Time Period
              </h2>
            </div>
            <VotingTimePeriod />
          </section>

          {/* Announce Winner */}
          <section className="group bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-gray-600 hover:border-green-500/70 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-xl mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Announce Winner
              </h2>
            </div>
            <AnnounceWinner />
          </section>

          {/* Emergency Declare */}
          <section className="group bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-gray-600 hover:border-red-500/70 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-red-600 to-rose-600 p-3 rounded-xl mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                Emergency Declare
              </h2>
            </div>
            <EmergencyDeclare />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ElectionCommission;
