import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub, FaTelegram } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: "/", label: "Home" },
    { path: "/register-voter", label: "Register Voter" },
    { path: "/register-candidate", label: "Register Candidate" },
    { path: "/cast-vote", label: "Cast Vote" },
  ];

  const resources = [
    { path: "/voter-list", label: "Voter List" },
    { path: "/candidate-list", label: "Candidate List" },
    { path: "/election-commission", label: "Election Commission" },
    { path: "/token-marketplace", label: "Token Marketplace" },
  ];

  const socialLinks = [
    { icon: FaFacebook, href: "https://facebook.com", color: "hover:text-blue-500" },
    { icon: FaTwitter, href: "https://twitter.com", color: "hover:text-blue-400" },
    { icon: FaInstagram, href: "https://instagram.com", color: "hover:text-pink-500" },
    { icon: FaLinkedin, href: "https://linkedin.com", color: "hover:text-blue-600" },
    { icon: FaGithub, href: "https://github.com", color: "hover:text-gray-300" },
    { icon: FaTelegram, href: "https://telegram.org", color: "hover:text-blue-400" },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      toast.success("Thanks for subscribing!");
      e.target.reset();
    }
  };

  return (
    <footer className="relative bg-gray-900 text-gray-300 mt-auto border-t border-gray-800">
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <div className="container mx-auto px-6 py-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Voting DApp
                </h3>
                <p className="text-base text-gray-500 font-semibold">Blockchain Democracy</p>
              </div>
            </div>
            <p className="text-xl text-gray-200 leading-relaxed font-semibold">
              A secure, transparent blockchain voting platform. Empowering democracy through decentralized technology.
            </p>
            <div className="flex items-center space-x-3 bg-gray-800/50 px-4 py-2.5 rounded-lg border border-gray-700">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-lg text-gray-200 font-bold">Holesky Testnet</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-2xl font-extrabold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map(({ path, label }) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="text-xl text-gray-200 hover:text-blue-400 transition-colors flex items-center group font-semibold"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-xl">→</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-2xl font-extrabold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Resources
            </h4>
            <ul className="space-y-2.5">
              {resources.map(({ path, label }) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="text-xl text-gray-200 hover:text-purple-400 transition-colors flex items-center group font-semibold"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-xl">→</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-2xl font-extrabold text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Stay Updated
            </h4>
            <p className="text-xl text-gray-200 mb-3 leading-relaxed font-semibold">
              Subscribe for election updates and new features.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors font-medium"
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-xl font-bold text-white transition-all duration-300 hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Social & Stats */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Social Links */}
            <div className="flex items-center space-x-2">
              <span className="text-xl text-gray-200 mr-3 font-bold">Follow:</span>
              {socialLinks.map(({ icon: Icon, href, color }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 bg-gray-800/50 rounded-lg border border-gray-700 ${color} transition-all duration-300 hover:scale-110`}
                >
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-lg text-gray-200">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-bold">Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-bold">Blockchain</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-bold">Private</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 text-xl text-gray-200">
            <p className="font-semibold">
              &copy; {currentYear} <span className="text-blue-400 font-bold">Voting DApp</span>. All rights reserved.
            </p>
            <div className="flex items-center space-x-5 text-lg">
              <a href="#" className="hover:text-blue-400 transition-colors font-semibold">Privacy</a>
              <span className="font-bold">•</span>
              <a href="#" className="hover:text-blue-400 transition-colors font-semibold">Terms</a>
              <span className="font-bold">•</span>
              <a href="#" className="hover:text-blue-400 transition-colors font-semibold">Docs</a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 z-40"
        aria-label="Scroll to top"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;
