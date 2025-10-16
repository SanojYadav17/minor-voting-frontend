import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { web3State } = useWeb3Context();
  const { selectedAccount, chainId } = web3State;
  const account = selectedAccount || "";
  const location = useLocation();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast.success("Address copied!");
    }
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/", label: "Home" },
    { path: "/register-voter", label: "Register Voter" },
    { path: "/register-candidate", label: "Register Candidate" },
    { path: "/voter-list", label: "Voter List" },
    { path: "/candidate-list", label: "Candidate List" },
    { path: "/cast-vote", label: "Cast Vote" },
    { path: "/election-commission", label: "Election Commission" },
    { path: "/token-marketplace", label: "Token Marketplace" },
  ];

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-gray-900/98 backdrop-blur-lg shadow-2xl border-b border-purple-500/30" 
          : "bg-gray-900/95 backdrop-blur-md border-b border-gray-800"
      }`}
    >
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-8px) rotate(5deg); }
              }
              @keyframes glow-pulse {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
              }
              @keyframes gradient-shift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
            `}</style>
            <div className="relative">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-md transition-all duration-300"
                style={{ 
                  animation: 'glow-pulse 2s ease-in-out infinite',
                  backgroundSize: '200% 200%'
                }}
              ></div>
              <div 
                className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-3 rounded-xl group-hover:scale-110 transition-all duration-300"
                style={{ 
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 3s ease infinite'
                }}
              >
                <svg 
                  className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ animation: 'float 3s ease-in-out infinite' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h1 
                className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight group-hover:scale-105 transition-transform duration-300"
                style={{ 
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 3s ease infinite'
                }}
              >
                Voting DApp
              </h1>
              <p 
                className="text-xs font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight group-hover:scale-105 transition-all duration-300"
                style={{ 
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 4s ease infinite reverse'
                }}
              >
                ✨ Blockchain Democracy ✨
              </p>
            </div>
          </Link>

          {/* Desktop Menu - Centered and Scrollable */}
          <div className="hidden lg:flex items-center flex-1 mx-6 overflow-x-auto scrollbar-hide">
            <div className="flex items-center space-x-1.5 mx-auto">
              {menuItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                    isActive(path)
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                      : "text-gray-100 hover:bg-gray-800 hover:text-white hover:scale-105"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
            {chainId && (
              <div className="flex items-center bg-gray-800/60 px-4 py-2.5 rounded-lg border border-gray-700">
                <div className={`w-2.5 h-2.5 rounded-full mr-2 ${chainId === 17000n ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-200 font-semibold">
                  {chainId === 17000n ? 'Holesky' : `Chain ${chainId}`}
                </span>
              </div>
            )}
            
            {account ? (
              <>
                {/* Dummy Profile Photo */}
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-600 overflow-hidden">
                    <svg className="w-full h-full text-gray-400" viewBox="0 0 100 100" fill="currentColor">
                      <circle cx="50" cy="35" r="20" />
                      <path d="M50 55 C30 55, 20 65, 20 85 L20 100 L80 100 L80 85 C80 65, 70 55, 50 55 Z" />
                    </svg>
                  </div>
                </div>
                
                <button
                  onClick={copyAddress}
                  className="flex items-center bg-gradient-to-r from-blue-600/30 to-purple-600/30 px-5 py-2.5 rounded-lg border border-blue-500/50 hover:border-blue-400 transition-all duration-300 group"
                >
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="text-base font-bold text-white">{shortenAddress(account)}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center bg-red-600/20 px-5 py-2.5 rounded-lg border border-red-500/50">
                <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-base text-red-300 font-semibold">Not Connected</span>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-4">
            {account && (
              <div className="mb-3 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300 font-semibold">Connected</span>
                  {chainId && (
                    <span className="flex items-center text-sm text-gray-300 font-medium">
                      <div className={`w-2.5 h-2.5 rounded-full mr-1.5 ${chainId === 17000n ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {chainId === 17000n ? 'Holesky' : `Chain ${chainId}`}
                    </span>
                  )}
                </div>
                <button
                  onClick={copyAddress}
                  className="w-full flex items-center justify-between bg-gray-900/50 px-4 py-3 rounded-lg"
                >
                  <span className="text-base font-mono text-white font-semibold">{shortenAddress(account)}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            )}
            
            <ul className="space-y-1.5">
              {menuItems.map(({ path, label }) => (
                <li key={path}>
                  <Link
                    to={path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-300 ${
                      isActive(path)
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "text-gray-200 hover:bg-gray-800"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
